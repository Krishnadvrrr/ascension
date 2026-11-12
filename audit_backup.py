"""Isolated encrypted backup and restore regression check."""
import gzip
import json
import os
import tempfile
from pathlib import Path

from cryptography.fernet import Fernet
from sqlalchemy import create_engine

with tempfile.TemporaryDirectory(prefix='ascension-backup-audit-') as folder:
    source = Path(folder) / 'source.db'
    target = Path(folder) / 'target.db'
    os.environ.pop('RENDER', None)
    os.environ['DATABASE_URL'] = 'sqlite:///' + source.as_posix()
    os.environ['FLASK_SECRET_KEY'] = 'isolated-backup-test-secret'
    from app import app, db
    from backup_database import export_data, restore_data

    client = app.test_client()
    response = client.post('/register', json={'name': 'backup-hunter', 'password': 'UniquePass123!'})
    assert response.status_code == 201, response.json
    account = response.json['character']['id']
    response = client.post('/log-task', json={'character_id': account, 'name': 'Run', 'area': 'gym'})
    assert response.status_code in (200, 201), response.json
    response = client.post('/state/save', json={'character_id': account, 'shadow_unlocks': ['igris', 'iron'], 'equipped_items': ['creatine']})
    assert response.status_code == 200, response.json
    with app.app_context():
        original = export_data(db.engine)
        key = Fernet.generate_key()
        token = Fernet(key).encrypt(gzip.compress(json.dumps(original).encode()))
        decrypted = json.loads(gzip.decompress(Fernet(key).decrypt(token)))
        target_engine = create_engine('sqlite:///' + target.as_posix())
        db.metadata.create_all(target_engine)
        restore_data(target_engine, decrypted)
        restored = export_data(target_engine)
        assert restored['tables'] == original['tables']
        try:
            restore_data(target_engine, decrypted)
        except ValueError as exc:
            assert 'not empty' in str(exc)
        else:
            raise AssertionError('Nonempty restore was not rejected')
        target_engine.dispose()
        db.session.remove()
        db.engine.dispose()
    print('PASS: encrypted export, all-table restore, preserved records, nonempty restore rejected.')
