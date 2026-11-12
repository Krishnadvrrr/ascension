"""Isolated account/history regression checks. Never uses the live database."""
import os
import tempfile
from pathlib import Path
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor

with tempfile.TemporaryDirectory(prefix='ascension-audit-') as folder:
    os.environ.pop('RENDER', None)
    os.environ['DATABASE_URL'] = 'sqlite:///' + (Path(folder) / 'audit.db').as_posix()
    os.environ['FLASK_SECRET_KEY'] = 'isolated-test-secret'
    os.environ['COOKIE_SECURE'] = 'false'
    from app import app, db, Character, LogBook, Task
    app.config['TESTING'] = True
    ids = []
    for index in range(100):
        client = app.test_client()
        response = client.post('/register', json={'name': f'hunter-{index}', 'password': 'UniquePass123!'})
        assert response.status_code == 201, response.json
        ids.append(response.json['character']['id'])
    with app.app_context():
        rows = []
        for account in ids:
            for day in range(1, 366):
                rows.append({'character_id': account, 'date': (datetime.utcnow() - timedelta(days=day)).strftime('%Y-%m-%d'), 'gym_summary': f'Private history for {account}', 'rating': 5})
        db.session.execute(db.insert(LogBook), rows)
        db.session.commit()
    for index, account in enumerate(ids):
        device = app.test_client()
        response = device.post('/login', json={'username': f'HUNTER-{index}', 'password': 'UniquePass123!'})
        assert response.status_code == 200, response.json
        assert response.json['character']['id'] == account
        history = device.get(f'/logbook/history/{account}').json['logs']
        assert len(history) == 365
        assert all(log['character_id'] == account for log in history)
        assert device.get(f'/logbook/history/{ids[(index + 1) % 100]}').status_code == 403
    anonymous = app.test_client()
    state_client = app.test_client()
    assert state_client.post('/login', json={'username': 'hunter-0', 'password': 'UniquePass123!'}).status_code == 200
    assert state_client.post('/state/save', json={'character_id': ids[0], 'shadow_unlocks': ['igris', 'iron'], 'equipped_items': ['creatine']}).status_code == 200
    second_device = app.test_client()
    assert second_device.post('/login', json={'username': 'hunter-0', 'password': 'UniquePass123!'}).status_code == 200
    assert second_device.get(f'/state/{ids[0]}').json == {'shadow_unlocks': ['igris', 'iron'], 'equipped_items': ['creatine']}
    assert second_device.get(f'/state/{ids[1]}').status_code == 403
    assert anonymous.post('/log-task', json={'name': 'No account'}).status_code == 401
    assert anonymous.post('/login', json={'username': 'unknown', 'password': 'Anything123'}).status_code == 404
    assert anonymous.post('/login', json={'username': 'hunter-0', 'password': 'wrong'}).status_code == 401
    assert anonymous.post('/register', json={'name': 'HUNTER-0', 'password': 'Anything123'}).status_code == 400
    def complete(_):
        device = app.test_client()
        with device.session_transaction() as session:
            session['character_id'] = ids[0]
        return device.post('/log-task', json={'character_id': ids[0], 'name': 'Daily squat', 'area': 'gym'}).status_code
    with ThreadPoolExecutor(max_workers=8) as pool:
        assert all(status in (200, 201) for status in pool.map(complete, range(16)))
    with app.app_context():
        assert Task.query.filter_by(character_id=ids[0], name='Daily squat').count() == 1
        assert db.session.get(Character, ids[0]).total_xp == 20
        db.session.get(Character, ids[0]).split_streak_21 = 20
        db.session.commit()
    first_mark = second_device.post('/attendance/mark', json={'character_id': ids[0], 'split_day_name': 'Push'})
    second_mark = second_device.post('/attendance/mark', json={'character_id': ids[0], 'split_day_name': 'Push'})
    assert first_mark.json['awakening_surge'] is True
    assert second_mark.json['awakening_surge'] is False
    assert second_mark.json['character']['total_xp'] == first_mark.json['character']['total_xp']
    with app.app_context():
        legacy = Character(name='legacy', password='old-password')
        db.session.add(legacy)
        db.session.commit()
        legacy_id = legacy.id
    assert anonymous.post('/login', json={'username': 'legacy', 'password': 'old-password'}).status_code == 200
    with app.app_context():
        assert '$' in db.session.get(Character, legacy_id).password
        db.session.remove()
        db.engine.dispose()
    print('PASS: 100 accounts; 36,500 private daily logs; new-device logins and inventory; isolation; invalid logins; duplicate registration; 16 concurrent task saves award XP once; legacy password upgrade.')
