"""Encrypted whole-database export and restore for Ascension.

Set DATABASE_URL and BACKUP_KEY in the environment. Store BACKUP_KEY separately
from the encrypted files. Never commit either value or the backup files.
"""
import argparse
import gzip
import json
import os
from datetime import date, datetime
from pathlib import Path

from cryptography.fernet import Fernet
from sqlalchemy import Date, DateTime, select, text

from app import app, db

TABLES = ('character', 'log_book', 'attendance', 'weight_log', 'task', 'auth_window', 'user_state')


def cipher():
    key = os.environ.get('BACKUP_KEY')
    if not key:
        raise SystemExit('BACKUP_KEY is required; generate one with Fernet.generate_key() and store it privately.')
    return Fernet(key.encode())


def export_data(engine):
    result = {'format': 'ascension-db-v1', 'exported_at': datetime.utcnow().isoformat(), 'tables': {}}
    with engine.connect() as connection:
        # Consistent snapshot on Postgres. SQLite obtains its normal read transaction.
        if engine.dialect.name == 'postgresql':
            connection.execute(text('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ, READ ONLY'))
        for name in TABLES:
            table = db.metadata.tables[name]
            result['tables'][name] = [
                {key: value.isoformat() if isinstance(value, (date, datetime)) else value
                 for key, value in row.items()}
                for row in connection.execute(select(table)).mappings()
            ]
        connection.rollback()
    return result


def restore_data(engine, payload):
    if payload.get('format') != 'ascension-db-v1' or set(payload.get('tables', {})) != set(TABLES):
        raise ValueError('This is not a complete Ascension database backup.')
    with engine.begin() as connection:
        for name in TABLES:
            table = db.metadata.tables[name]
            if connection.execute(select(table).limit(1)).first() is not None:
                raise ValueError(f'Target table {name} is not empty. Restore requires a fresh database.')
        for name in TABLES:
            table = db.metadata.tables[name]
            rows = payload['tables'][name]
            for batch_start in range(0, len(rows), 500):
                batch = []
                for record in rows[batch_start:batch_start + 500]:
                    values = dict(record)
                    for column in table.columns:
                        if isinstance(column.type, DateTime) and values.get(column.name):
                            values[column.name] = datetime.fromisoformat(values[column.name])
                        elif isinstance(column.type, Date) and values.get(column.name):
                            values[column.name] = date.fromisoformat(values[column.name])
                    batch.append(values)
                if batch:
                    connection.execute(table.insert(), batch)
        if engine.dialect.name == 'postgresql':
            for name in TABLES:
                table = db.metadata.tables[name]
                if 'id' in table.columns:
                    connection.execute(text(
                        f"SELECT setval(pg_get_serial_sequence('{name}', 'id'), "
                        f"GREATEST(COALESCE((SELECT MAX(id) FROM {name}), 0), 1), "
                        f"(SELECT COUNT(*) > 0 FROM {name}))"
                    ))


def main():
    parser = argparse.ArgumentParser(description='Encrypted Ascension backup or empty-database restore')
    parser.add_argument('action', choices=('backup', 'restore'))
    parser.add_argument('file', type=Path)
    args = parser.parse_args()
    with app.app_context():
        if args.action == 'backup':
            if args.file.exists():
                raise SystemExit('Backup path already exists; refusing to overwrite it.')
            data = export_data(db.engine)
            packed = gzip.compress(json.dumps(data, separators=(',', ':')).encode())
            args.file.parent.mkdir(parents=True, exist_ok=True)
            args.file.write_bytes(cipher().encrypt(packed))
            print(f'Encrypted backup saved: {args.file} — ' + ', '.join(f'{name}: {len(rows)}' for name, rows in data['tables'].items()))
        else:
            payload = json.loads(gzip.decompress(cipher().decrypt(args.file.read_bytes())))
            restore_data(db.engine, payload)
            print('Restore completed into an empty database. Verify counts and account histories before use.')


if __name__ == '__main__':
    main()
