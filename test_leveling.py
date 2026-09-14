import requests
import json

BASE_URL = 'http://localhost:5000'

print("=" * 60)
print("DISCIPLINE LEVELING SYSTEM TEST")
print("=" * 60)

# TEST 1: Create a character
print("\n1️⃣ Creating a character...")
response = requests.post(f'{BASE_URL}/create-character', 
    json={'name': 'Youfic'}
)
character = response.json()['character']
character_id = character['id']
print(f"✓ Character created: {character['name']}")
print(f"  Level: {character['level']}")
print(f"  XP: {character['current_xp']}/{character['xp_for_next_level']}")

# TEST 2: Log a fitness task
print("\n2️⃣ Logging fitness task (Going to gym)...")
response = requests.post(f'{BASE_URL}/log-task',
    json={
        'character_id': character_id,
        'name': 'Gym Workout',
        'area': 'fitness',
        'description': '1 hour weightlifting',
        'difficulty': 'medium'
    }
)
result = response.json()
print(f"✓ Task logged!")
print(f"  XP Gained: +{result['xp_gained']}")
print(f"  New XP: {result['character']['current_xp']}/{result['character']['xp_for_next_level']}")

# TEST 3: Log an academic task
print("\n3️⃣ Logging academic task (Study)...")
response = requests.post(f'{BASE_URL}/log-task',
    json={
        'character_id': character_id,
        'name': 'Study Python',
        'area': 'academics',
        'description': '2 hours learning Flask',
        'difficulty': 'hard'
    }
)
result = response.json()
print(f"✓ Task logged!")
print(f"  XP Gained: +{result['xp_gained']}")
print(f"  New XP: {result['character']['current_xp']}/{result['character']['xp_for_next_level']}")

# TEST 4: Log a hobby task
print("\n4️⃣ Logging hobby task (Reading)...")
response = requests.post(f'{BASE_URL}/log-task',
    json={
        'character_id': character_id,
        'name': 'Read Solo Leveling',
        'area': 'hobbies',
        'description': '30 mins reading',
        'difficulty': 'easy'
    }
)
result = response.json()
print(f"✓ Task logged!")
print(f"  XP Gained: +{result['xp_gained']}")
print(f"  New XP: {result['character']['current_xp']}/{result['character']['xp_for_next_level']}")

# TEST 5: Log more tasks to level up
print("\n5️⃣ Logging more tasks to level up...")
for i in range(4):
    requests.post(f'{BASE_URL}/log-task',
        json={
            'character_id': character_id,
            'name': f'Daily Task {i+1}',
            'area': 'fitness',
            'difficulty': 'medium'
        }
    )
print("✓ 4 more tasks logged!")

# TEST 6: Get final character stats
print("\n6️⃣ Getting final character stats...")
response = requests.get(f'{BASE_URL}/stats/{character_id}')
stats = response.json()
character = stats['character']

print(f"\n🎯 FINAL STATS:")
print(f"  Level: {character['level']}")
print(f"  Total XP: {character['total_xp']}")
print(f"  Current XP: {character['current_xp']}/{character['xp_for_next_level']}")
print(f"\n  📊 Stats:")
print(f"    Discipline: {character['stats']['discipline']}")
print(f"    Focus: {character['stats']['focus']}")
print(f"    Strength: {character['stats']['strength']}")
print(f"    Endurance: {character['stats']['endurance']}")
print(f"\n  📝 Tasks by Area:")
for area, count in stats['tasks_by_area'].items():
    print(f"    {area.capitalize()}: {count} tasks")
print(f"\n  Total Tasks Completed: {stats['total_tasks_completed']}")

print("\n" + "=" * 60)
print("✅ ALL TESTS COMPLETE!")
print("=" * 60)