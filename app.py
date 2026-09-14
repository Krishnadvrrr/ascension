import json
from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta

app = Flask(__name__)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///discipline_tracker.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# ========================
# RANK & XP PROGRESSION MATH
# ========================

def get_xp_required_for_level(level):
    """
    Exact Solo Leveling rank and difficulty curve:
    - Levels 1-25 (E-Rank): 1,500 XP per level
    - Levels 26-50 (D-Rank): 2,500 XP per level
    - Levels 51-75 (C-Rank): 4,000 XP per level
    - Levels 76-90 (B-Rank): 6,500 XP per level (~3 months of strict discipline)
    - Levels 91-100 (A-Rank): 10,000 XP per level
    - Levels 101+ (S-Rank Shadow Monarch): 15,000 XP per level
    """
    if level <= 25:
        return 1500
    elif level <= 50:
        return 2500
    elif level <= 75:
        return 4000
    elif level <= 90:
        return 6500
    elif level <= 100:
        return 10000
    else:
        return 15000

def get_rank_for_level(level):
    if level <= 25:
        return "E-RANK HUNTER"
    elif level <= 50:
        return "D-RANK HUNTER"
    elif level <= 75:
        return "C-RANK HUNTER"
    elif level <= 90:
        return "B-RANK HUNTER"
    elif level <= 100:
        return "A-RANK HUNTER"
    else:
        return "S-RANK SHADOW MONARCH"


# ========================
# DATABASE MODELS
# ========================

class Character(db.Model):
    """User's character/profile"""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), default='')
    google_id = db.Column(db.String(120), default='')
    avatar_url = db.Column(db.String(300), default='')
    password = db.Column(db.String(128), default='hunter123')
    level = db.Column(db.Integer, default=1)
    total_xp = db.Column(db.Integer, default=0)
    current_xp = db.Column(db.Integer, default=0)
    xp_for_next_level = db.Column(db.Integer, default=1500)
    
    # Onboarding & Goals
    selected_goals = db.Column(db.Text, default='["gym"]')
    workout_split = db.Column(db.Text, default='{}')
    weight_goal_type = db.Column(db.String(20), default='maintain') # lose, gain, maintain
    current_weight = db.Column(db.Float, default=75.0)
    target_weight = db.Column(db.Float, default=75.0)
    onboarding_completed = db.Column(db.Boolean, default=False)
    
    # Education & Skills
    education_level = db.Column(db.String(20), default='college') # 'school' or 'college'
    education_detail = db.Column(db.String(100), default='B.Tech Computer Science')
    ecc_skill = db.Column(db.String(100), default='Web Development')
    custom_daily_quests = db.Column(db.Text, default='[]')
    
    # Streaks, Log Book & Penalties
    daily_streak = db.Column(db.Integer, default=0)
    split_streak_21 = db.Column(db.Integer, default=0)
    last_logged_date = db.Column(db.String(20), default='')
    last_penalty_date = db.Column(db.String(20), default='')
    last_logbook_date = db.Column(db.String(20), default='')
    last_logbook_penalty_date = db.Column(db.String(20), default='')
    
    # Stats
    discipline = db.Column(db.Integer, default=10)
    focus = db.Column(db.Integer, default=10)
    strength = db.Column(db.Integer, default=10)
    endurance = db.Column(db.Integer, default=10)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    tasks = db.relationship('Task', backref='character', lazy=True, cascade='all, delete-orphan')
    attendance_records = db.relationship('Attendance', backref='character', lazy=True, cascade='all, delete-orphan')
    weight_logs = db.relationship('WeightLog', backref='character', lazy=True, cascade='all, delete-orphan')
    logbooks = db.relationship('LogBook', backref='character', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        try:
            goals = json.loads(self.selected_goals) if self.selected_goals else ["gym"]
        except Exception:
            goals = ["gym"]
            
        try:
            split = json.loads(self.workout_split) if self.workout_split else {}
        except Exception:
            split = {}

        try:
            custom_quests = json.loads(self.custom_daily_quests) if self.custom_daily_quests else []
        except Exception:
            custom_quests = []

        needed_xp = get_xp_required_for_level(self.level)

        return {
            'id': self.id,
            'name': self.name,
            'level': self.level,
            'rank': get_rank_for_level(self.level),
            'total_xp': self.total_xp,
            'current_xp': self.current_xp,
            'xp_for_next_level': needed_xp,
            'xp_progress': f"{self.current_xp}/{needed_xp}",
            'selected_goals': goals,
            'workout_split': split,
            'weight_goal_type': self.weight_goal_type or 'maintain',
            'current_weight': self.current_weight or 75.0,
            'target_weight': self.target_weight or 75.0,
            'onboarding_completed': bool(self.onboarding_completed),
            'email': self.email or '',
            'google_id': self.google_id or '',
            'avatar_url': self.avatar_url or '',
            'is_google_user': bool(self.google_id),
            'education_level': self.education_level or 'college',
            'education_detail': self.education_detail or 'B.Tech Computer Science',
            'ecc_skill': self.ecc_skill or 'Web Development',
            'custom_daily_quests': custom_quests,
            'daily_streak': self.daily_streak or 0,
            'split_streak_21': self.split_streak_21 or 0,
            'last_logged_date': self.last_logged_date or '',
            'last_logbook_date': self.last_logbook_date or '',
            'stats': {
                'discipline': self.discipline,
                'focus': self.focus,
                'strength': self.strength,
                'endurance': self.endurance
            },
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }


class LogBook(db.Model):
    """Daily Hunter Chronicle / Student Experience Log"""
    id = db.Column(db.Integer, primary_key=True)
    character_id = db.Column(db.Integer, db.ForeignKey('character.id'), nullable=False)
    date = db.Column(db.String(20), nullable=False) # YYYY-MM-DD
    gym_summary = db.Column(db.Text, default='')
    academics_summary = db.Column(db.Text, default='')
    ecc_summary = db.Column(db.Text, default='')
    reflection = db.Column(db.Text, default='')
    rating = db.Column(db.Integer, default=5) # 1 to 5
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'character_id': self.character_id,
            'date': self.date,
            'gym_summary': self.gym_summary or '',
            'academics_summary': self.academics_summary or '',
            'ecc_summary': self.ecc_summary or '',
            'reflection': self.reflection or '',
            'rating': self.rating or 5,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }


class Attendance(db.Model):
    """Calendar attendance for workout splits and rest days"""
    id = db.Column(db.Integer, primary_key=True)
    character_id = db.Column(db.Integer, db.ForeignKey('character.id'), nullable=False)
    date = db.Column(db.String(20), nullable=False) # YYYY-MM-DD
    split_day_name = db.Column(db.String(100), default='Workout')
    is_rest_day = db.Column(db.Boolean, default=False)
    status = db.Column(db.String(50), default='completed') # completed, rest_adhered, missed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'date': self.date,
            'split_day_name': self.split_day_name,
            'is_rest_day': self.is_rest_day,
            'status': self.status
        }


class WeightLog(db.Model):
    """Logs weight over time to track cutting/bulking trajectory"""
    id = db.Column(db.Integer, primary_key=True)
    character_id = db.Column(db.Integer, db.ForeignKey('character.id'), nullable=False)
    weight = db.Column(db.Float, nullable=False)
    logged_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'weight': self.weight,
            'date': self.logged_at.strftime('%Y-%m-%d %H:%M')
        }


class Task(db.Model):
    """Fitness/life tasks"""
    id = db.Column(db.Integer, primary_key=True)
    character_id = db.Column(db.Integer, db.ForeignKey('character.id'), nullable=False)
    
    name = db.Column(db.String(200), nullable=False)
    area = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text)
    difficulty = db.Column(db.String(20), default='medium')
    xp_reward = db.Column(db.Integer, default=20)
    
    completed_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'area': self.area,
            'description': self.description,
            'difficulty': self.difficulty,
            'xp_reward': self.xp_reward,
            'completed_at': self.completed_at.strftime('%Y-%m-%d %H:%M:%S')
        }


# ========================
# PENALTY SYSTEM
# ========================

def check_and_apply_penalties(character):
    """
    Checks consecutive missed days and applies penalties:
    - 2+ consecutive missed days: -150 XP
    - 5 consecutive missed days: -500 XP + streak reset
    - 7 consecutive missed days: -750 XP + streak reset + emergency warning
    - Missed Daily Log Book: -50 XP
    """
    today_str = datetime.utcnow().strftime('%Y-%m-%d')
    yesterday_str = (datetime.utcnow() - timedelta(days=1)).strftime('%Y-%m-%d')
    
    xp_deducted = 0
    penalty_zone = False
    logbook_penalized = False
    streak_penalized = False
    days_missed = 0

    # 1. Daily Log Book Inaction Penalty Check (-50 EXP)
    if character.onboarding_completed and character.last_logbook_penalty_date != today_str:
        char_created_date = character.created_at.strftime('%Y-%m-%d') if character.created_at else today_str
        if char_created_date < today_str:
            has_yesterday_log = LogBook.query.filter_by(character_id=character.id, date=yesterday_str).first() is not None
            if not has_yesterday_log:
                logbook_loss = 50
                character.current_xp = max(0, character.current_xp - logbook_loss)
                character.last_logbook_penalty_date = today_str
                xp_deducted += logbook_loss
                logbook_penalized = True

    # 2. General Consecutive Days Inaction Check
    if character.last_logged_date and character.last_penalty_date != today_str:
        try:
            last_date = datetime.strptime(character.last_logged_date, '%Y-%m-%d')
            today_date = datetime.strptime(today_str, '%Y-%m-%d')
            days_missed = (today_date - last_date).days
        except Exception:
            days_missed = 0

        if days_missed >= 2:
            streak_loss = 0
            if days_missed >= 7:
                streak_loss = 750
                character.daily_streak = 0
                character.split_streak_21 = 0
                penalty_zone = True
            elif days_missed >= 5:
                streak_loss = 500
                character.daily_streak = 0
                character.split_streak_21 = 0
            elif days_missed >= 2:
                streak_loss = 150

            if streak_loss > 0:
                character.current_xp = max(0, character.current_xp - streak_loss)
                character.last_penalty_date = today_str
                xp_deducted += streak_loss
                streak_penalized = True

    if xp_deducted > 0:
        db.session.commit()
        return {
            'penalty_applied': True,
            'xp_lost': xp_deducted,
            'days_missed': days_missed,
            'penalty_zone': penalty_zone,
            'logbook_penalized': logbook_penalized,
            'streak_penalized': streak_penalized
        }

    return {'penalty_applied': False}


# ========================
# ROUTES
# ========================

@app.route('/login', methods=['POST'])
def login():
    """Authenticate or awaken a Hunter profile"""
    data = request.json or {}
    username = (data.get('username') or data.get('name') or '').strip()
    password = (data.get('password') or '').strip()
    
    if not username:
        return jsonify({'error': 'Hunter ID / Name is required'}), 400
    
    character = Character.query.filter(db.func.lower(Character.name) == username.lower()).first()
    
    if not character:
        character = Character(name=username, password=password if password else 'hunter123')
        db.session.add(character)
        db.session.commit()
        return jsonify({
            'message': 'System awakened! New Hunter registered.',
            'character': character.to_dict(),
            'is_new': True,
            'penalty': {'penalty_applied': False}
        }), 200
    
    if password and character.password and character.password != password:
        return jsonify({'error': 'Invalid Hunter passcode. Access denied.'}), 401
    
    # Check for consecutive days inaction penalty & logbook penalty
    penalty_info = check_and_apply_penalties(character)
    
    return jsonify({
        'message': 'Access granted. Welcome back, Hunter.',
        'character': character.to_dict(),
        'penalty': penalty_info
    }), 200


@app.route('/auth/google', methods=['POST'])
def auth_google():
    """Authenticate or awaken a Hunter using Google account/credentials"""
    data = request.json or {}
    email = (data.get('email') or '').strip().lower()
    name = (data.get('name') or '').strip()
    google_id = (data.get('google_id') or data.get('sub') or '').strip()
    avatar_url = (data.get('avatar_url') or data.get('picture') or '').strip()

    if not email and not name and not google_id:
        return jsonify({'error': 'Google authentication data required'}), 400

    if not name and email:
        name = email.split('@')[0].capitalize()
    if not name:
        name = f"Hunter_{google_id[-6:] if len(google_id) >= 6 else 'Google'}"

    # Lookup existing character by google_id, email, or codename
    character = None
    if google_id:
        character = Character.query.filter_by(google_id=google_id).first()
    if not character and email:
        character = Character.query.filter_by(email=email).first()
    if not character:
        character = Character.query.filter(db.func.lower(Character.name) == name.lower()).first()

    is_new = False
    if not character:
        character = Character(
            name=name,
            email=email,
            google_id=google_id,
            avatar_url=avatar_url,
            password='google_oauth_hunter'
        )
        db.session.add(character)
        db.session.commit()
        is_new = True
    else:
        # Update metadata if needed
        updated = False
        if email and not character.email:
            character.email = email
            updated = True
        if google_id and not character.google_id:
            character.google_id = google_id
            updated = True
        if avatar_url and not character.avatar_url:
            character.avatar_url = avatar_url
            updated = True
        if updated:
            db.session.commit()

    penalty_info = check_and_apply_penalties(character)

    return jsonify({
        'message': f'Google Awakening Complete. Welcome Hunter {character.name}.',
        'character': character.to_dict(),
        'is_new': is_new,
        'penalty': penalty_info
    }), 200


@app.route('/register', methods=['POST'])
def register():
    data = request.json or {}
    name = (data.get('name') or data.get('username') or '').strip()
    password = (data.get('password') or 'hunter123').strip()
    
    if not name:
        return jsonify({'error': 'Hunter Codename is required'}), 400
    
    existing = Character.query.filter(db.func.lower(Character.name) == name.lower()).first()
    if existing:
        return jsonify({'error': 'Hunter Codename already registered'}), 400
    
    character = Character(name=name, password=password)
    db.session.add(character)
    db.session.commit()
    
    return jsonify({
        'message': 'Hunter Awakening Protocol Complete!',
        'character': character.to_dict()
    }), 201


@app.route('/character/<int:character_id>', methods=['GET'])
def get_character(character_id):
    character = Character.query.get(character_id)
    if not character:
        return jsonify({'error': 'Character not found'}), 404
    
    penalty_info = check_and_apply_penalties(character)
    res = character.to_dict()
    res['penalty'] = penalty_info
    return jsonify(res)


# ========================
# ONBOARDING & GOALS
# ========================

@app.route('/onboarding/status/<int:character_id>', methods=['GET'])
def onboarding_status(character_id):
    character = Character.query.get(character_id)
    if not character:
        return jsonify({'error': 'Hunter not found'}), 404
    return jsonify({
        'onboarding_completed': bool(character.onboarding_completed),
        'character': character.to_dict()
    })


def get_default_quests(character, today_split=None):
    """
    Generate default balanced quests:
    - Min 2 Gym (split workout adherence, protein macro hit, hydration)
    - Min 2 Academics (tailored to school grade/board or college degree)
    - Min 1 ECC (tailored to ecc_skill)
    """
    is_rest = today_split.get('is_rest', False) if today_split else False
    split_name = today_split.get('name', "Today's Split Workout") if today_split else "Assigned Split Regimen"
    workout_quest_name = "[REST PROTOCOL] Scheduled Rest Day Recovery" if is_rest else f"[WORKOUT] {split_name}"

    quests = [
        # Gym Quests (3)
        {
            'id': 'gym-1',
            'category': 'gym',
            'name': workout_quest_name,
            'description': 'Adhere strictly to today training schedule or rest day recovery.',
            'difficulty': 'medium',
            'xp_reward': 20
        },
        {
            'id': 'gym-2',
            'category': 'gym',
            'name': '[NUTRITION] Hit Daily Caloric Target & Protein Macro (1.6-2.2g/kg)',
            'description': 'Hit daily protein and clean calories according to bulking/cutting trajectory.',
            'difficulty': 'medium',
            'xp_reward': 20
        },
        {
            'id': 'gym-3',
            'category': 'gym',
            'name': '[HYDRATION & RECOVERY] 3.5L Water Hydration & 8h Sleep Protocol',
            'description': 'Hydrate muscular tissue and restore central nervous system.',
            'difficulty': 'medium',
            'xp_reward': 20
        }
    ]

    # Academics Quests (2)
    edu_level = getattr(character, 'education_level', None) or 'college'
    edu_detail = getattr(character, 'education_detail', None) or ('12th Grade CBSE' if edu_level == 'school' else 'B.Tech Computer Science')

    if edu_level == 'school':
        quests.extend([
            {
                'id': 'acad-1',
                'category': 'academics',
                'name': f'[ACADEMICS] Complete Daily School Homework & Board Prep ({edu_detail})',
                'description': 'Finish textbook problems, assignments, and class revisions.',
                'difficulty': 'medium',
                'xp_reward': 20
            },
            {
                'id': 'acad-2',
                'category': 'academics',
                'name': '[ACADEMICS] 2-Hour Core Subject Syllabus Deep Study Block',
                'description': 'Focus on difficult subjects with zero phone or tab distractions.',
                'difficulty': 'medium',
                'xp_reward': 20
            }
        ])
    else:
        quests.extend([
            {
                'id': 'acad-1',
                'category': 'academics',
                'name': f'[ACADEMICS] 2-Hour Degree Focus Block ({edu_detail})',
                'description': 'Master university engineering/degree syllabus and lecture topics.',
                'difficulty': 'medium',
                'xp_reward': 20
            },
            {
                'id': 'acad-2',
                'category': 'academics',
                'name': '[ACADEMICS] Technical Problem Solving & Coursework Practice',
                'description': 'Code solutions, lab assignments, or analytical problem sets.',
                'difficulty': 'medium',
                'xp_reward': 20
            }
        ])

    # ECC Quest (1)
    ecc = getattr(character, 'ecc_skill', None) or 'Web Development & Coding'
    quests.append({
        'id': 'ecc-1',
        'category': 'ecc',
        'name': f'[ECC SKILL] 45 Min Deliberate Practice on {ecc}',
        'description': 'Develop practical mastery, projects, or creative portfolio work.',
        'difficulty': 'medium',
        'xp_reward': 20
    })

    return quests


@app.route('/onboarding/save', methods=['POST'])
def save_onboarding():
    """Save education details, workout split, ECC skill, and target weights"""
    data = request.json or {}
    character_id = data.get('character_id') or 1
    character = Character.query.get(character_id)
    if not character:
        character = Character.query.first()
        if not character:
            return jsonify({'error': 'Hunter not found'}), 404

    education_level = data.get('education_level') or 'college'
    education_detail = (data.get('education_detail') or ('12th Grade CBSE' if education_level == 'school' else 'B.Tech Computer Science')).strip()
    ecc_skill = (data.get('ecc_skill') or 'Web Development & Coding').strip()

    workout_split = data.get('workout_split') or {}
    weight_goal_type = data.get('weight_goal_type') or 'maintain'
    current_weight = float(data.get('current_weight') or 75.0)
    target_weight = float(data.get('target_weight') or 75.0)

    character.education_level = education_level
    character.education_detail = education_detail
    character.ecc_skill = ecc_skill
    character.selected_goals = json.dumps(["gym", "academics", "extracurricular"])
    character.workout_split = json.dumps(workout_split)
    character.weight_goal_type = weight_goal_type
    character.current_weight = current_weight
    character.target_weight = target_weight
    character.onboarding_completed = True

    # Seed customized daily quests
    custom_quests = data.get('custom_daily_quests')
    if not custom_quests or len(custom_quests) < 5:
        custom_quests = get_default_quests(character)
    character.custom_daily_quests = json.dumps(custom_quests)

    # Record initial weight log
    w_log = WeightLog(character_id=character.id, weight=current_weight)
    db.session.add(w_log)

    db.session.commit()

    return jsonify({
        'message': 'Student Hunter Directives & Split Registered!',
        'character': character.to_dict()
    }), 200


# ========================
# LOG BOOK / DAILY CHRONICLE
# ========================

@app.route('/logbook/save', methods=['POST'])
def save_logbook():
    """Save user's daily experience chronicle and award XP"""
    data = request.json or {}
    character_id = data.get('character_id') or 1
    character = Character.query.get(character_id)
    if not character:
        return jsonify({'error': 'Hunter not found'}), 404

    today_str = datetime.utcnow().strftime('%Y-%m-%d')
    gym_summary = (data.get('gym_summary') or '').strip()
    academics_summary = (data.get('academics_summary') or '').strip()
    ecc_summary = (data.get('ecc_summary') or '').strip()
    reflection = (data.get('reflection') or '').strip()
    rating = int(data.get('rating') or 5)

    log_entry = LogBook.query.filter_by(character_id=character.id, date=today_str).first()
    is_new = False
    if not log_entry:
        log_entry = LogBook(
            character_id=character.id,
            date=today_str,
            gym_summary=gym_summary,
            academics_summary=academics_summary,
            ecc_summary=ecc_summary,
            reflection=reflection,
            rating=rating
        )
        db.session.add(log_entry)
        is_new = True
    else:
        log_entry.gym_summary = gym_summary
        log_entry.academics_summary = academics_summary
        log_entry.ecc_summary = ecc_summary
        log_entry.reflection = reflection
        log_entry.rating = rating

    character.last_logbook_date = today_str
    
    # Award +30 XP for writing the daily chronicle if first time today
    xp_awarded = 0
    level_up = False
    if is_new:
        xp_awarded = 30
        character.current_xp += xp_awarded
        character.total_xp += xp_awarded
        
        req_xp = get_xp_required_for_level(character.level)
        while character.current_xp >= req_xp:
            character.current_xp -= req_xp
            character.level += 1
            character.discipline += 2
            character.focus += 2
            character.strength += 1
            character.endurance += 1
            req_xp = get_xp_required_for_level(character.level)
            level_up = True

    db.session.commit()

    return jsonify({
        'message': 'Daily Chronicle registered to Hunter Archives!',
        'log': log_entry.to_dict(),
        'xp_awarded': xp_awarded,
        'level_up': level_up,
        'character': character.to_dict()
    }), 200


@app.route('/logbook/today/<int:character_id>', methods=['GET'])
def get_today_logbook(character_id):
    character = Character.query.get(character_id)
    if not character:
        return jsonify({'error': 'Hunter not found'}), 404

    today_str = datetime.utcnow().strftime('%Y-%m-%d')
    log_entry = LogBook.query.filter_by(character_id=character.id, date=today_str).first()
    return jsonify({
        'date': today_str,
        'logged': log_entry is not None,
        'log': log_entry.to_dict() if log_entry else None
    })


@app.route('/logbook/history/<int:character_id>', methods=['GET'])
def get_logbook_history(character_id):
    character = Character.query.get(character_id)
    if not character:
        return jsonify({'error': 'Hunter not found'}), 404

    logs = LogBook.query.filter_by(character_id=character.id).order_by(LogBook.date.desc()).limit(30).all()
    return jsonify({
        'logs': [l.to_dict() for l in logs]
    })


# ========================
# DAILY QUESTS MANAGEMENT
# ========================

@app.route('/quests/<int:character_id>', methods=['GET'])
def get_user_quests(character_id):
    character = Character.query.get(character_id)
    if not character:
        return jsonify({'error': 'Hunter not found'}), 404

    try:
        custom_quests = json.loads(character.custom_daily_quests) if character.custom_daily_quests else []
    except Exception:
        custom_quests = []

    # If no custom quests yet, populate defaults
    if not custom_quests or len(custom_quests) < 5:
        custom_quests = get_default_quests(character)
        character.custom_daily_quests = json.dumps(custom_quests)
        db.session.commit()

    return jsonify({
        'quests': custom_quests,
        'education_level': character.education_level or 'college',
        'education_detail': character.education_detail or '',
        'ecc_skill': character.ecc_skill or ''
    })


@app.route('/quests/save', methods=['POST'])
def save_user_quests():
    """
    Validate & save active daily quests:
    - Minimum 5 quests total
    - Minimum 2 Gym
    - Minimum 2 Academics
    - Minimum 1 ECC
    """
    data = request.json or {}
    character_id = data.get('character_id') or 1
    character = Character.query.get(character_id)
    if not character:
        return jsonify({'error': 'Hunter not found'}), 404

    quests = data.get('quests') or []

    # Validation
    gym_count = sum(1 for q in quests if q.get('category') == 'gym')
    acad_count = sum(1 for q in quests if q.get('category') == 'academics')
    ecc_count = sum(1 for q in quests if q.get('category') == 'ecc')
    total_count = len(quests)

    errors = []
    if total_count < 5:
        errors.append(f"Total quests must be at least 5 (currently {total_count}).")
    if gym_count < 2:
        errors.append(f"Must have at least 2 Gym quests (currently {gym_count}).")
    if acad_count < 2:
        errors.append(f"Must have at least 2 Academics quests (currently {acad_count}).")
    if ecc_count < 1:
        errors.append(f"Must have at least 1 Extracurricular (ECC) quest (currently {ecc_count}).")

    if errors:
        return jsonify({
            'error': ' '.join(errors),
            'counts': {'gym': gym_count, 'academics': acad_count, 'ecc': ecc_count, 'total': total_count}
        }), 400

    character.custom_daily_quests = json.dumps(quests)
    db.session.commit()

    return jsonify({
        'message': 'Daily quests updated successfully!',
        'quests': quests,
        'counts': {'gym': gym_count, 'academics': acad_count, 'ecc': ecc_count, 'total': total_count}
    }), 200


# ========================
# SPLIT & CALENDAR ATTENDANCE
# ========================

@app.route('/split/today/<int:character_id>', methods=['GET'])
def get_today_split(character_id):
    """Returns today's workout split and exercises based on user's 7-day schedule"""
    character = Character.query.get(character_id)
    if not character:
        return jsonify({'error': 'Hunter not found'}), 404

    try:
        split = json.loads(character.workout_split) if character.workout_split else {}
    except Exception:
        split = {}

    default_split = {
        "day_1": {"name": "Push (Chest, Shoulders, Triceps)", "is_rest": False, "exercises": ["Barbell Bench Press", "Incline Dumbbell Press", "Overhead Shoulder Press", "Tricep Pushdowns"]},
        "day_2": {"name": "Pull (Back & Biceps)", "is_rest": False, "exercises": ["Lat Pulldowns", "Barbell Bent-Over Rows", "Face Pulls", "Incline Bicep Curls"]},
        "day_3": {"name": "Legs & Core", "is_rest": False, "exercises": ["Barbell Squats", "Romanian Deadlifts", "Leg Press", "Hanging Leg Raises"]},
        "day_4": {"name": "Scheduled Rest Day (Recovery Protocol)", "is_rest": True, "exercises": ["Hydration Check", "Stretching & Mobility", "8 Hours Sleep"]},
        "day_5": {"name": "Push Hypertrophy", "is_rest": False, "exercises": ["Dumbbell Bench Press", "Cable Lateral Raises", "Dips", "Skull Crushers"]},
        "day_6": {"name": "Pull Hypertrophy", "is_rest": False, "exercises": ["Pull-ups / Chin-ups", "Seated Cable Rows", "Hammer Curls", "Rear Delt Flyes"]},
        "day_7": {"name": "Scheduled Rest Day (Recovery Protocol)", "is_rest": True, "exercises": ["Active Recovery", "Meal Prep", "Discipline Review"]}
    }

    active_split = split if split and len(split) > 0 else default_split

    weekday_idx = datetime.utcnow().weekday() + 1
    key = f"day_{weekday_idx}"
    today_workout = active_split.get(key, active_split.get("day_1", default_split["day_1"]))

    today_str = datetime.utcnow().strftime('%Y-%m-%d')
    att = Attendance.query.filter_by(character_id=character.id, date=today_str).first()

    return jsonify({
        'day_key': key,
        'day_number': weekday_idx,
        'split': today_workout,
        'is_rest_day': bool(today_workout.get('is_rest', False)),
        'already_logged': att is not None,
        'attendance_status': att.status if att else None,
        'split_streak_21': character.split_streak_21 or 0
    })


@app.route('/attendance/mark', methods=['POST'])
def mark_attendance():
    """
    Mark workout or rest-day attendance.
    Rest days count as valid adherence towards the 21-day streak!
    """
    data = request.json or {}
    character_id = data.get('character_id') or 1
    character = Character.query.get(character_id)
    if not character:
        return jsonify({'error': 'Hunter not found'}), 404

    is_rest_day = bool(data.get('is_rest_day', False))
    split_day_name = data.get('split_day_name') or ('Rest Day' if is_rest_day else 'Workout')
    today_str = datetime.utcnow().strftime('%Y-%m-%d')

    att = Attendance.query.filter_by(character_id=character.id, date=today_str).first()
    if not att:
        att = Attendance(
            character_id=character.id,
            date=today_str,
            split_day_name=split_day_name,
            is_rest_day=is_rest_day,
            status='rest_adhered' if is_rest_day else 'completed'
        )
        db.session.add(att)
        character.split_streak_21 = (character.split_streak_21 or 0) + 1
        character.last_logged_date = today_str
    else:
        att.is_rest_day = is_rest_day
        att.split_day_name = split_day_name
        att.status = 'rest_adhered' if is_rest_day else 'completed'

    # Check for 21-day unbroken discipline milestone
    awakening_surge = False
    if character.split_streak_21 >= 21:
        awakening_surge = True
        surge_xp = 3000
        character.current_xp += surge_xp
        character.total_xp += surge_xp

        req = get_xp_required_for_level(character.level)
        while character.current_xp >= req:
            character.current_xp -= req
            character.level += 1
            character.strength += 3
            character.discipline += 5
            character.focus += 3
            character.endurance += 3
            req = get_xp_required_for_level(character.level)

    db.session.commit()

    return jsonify({
        'message': 'Discipline marked on calendar!' if is_rest_day else 'Workout logged on calendar!',
        'attendance': att.to_dict(),
        'split_streak_21': character.split_streak_21,
        'awakening_surge': awakening_surge,
        'character': character.to_dict()
    })


@app.route('/attendance/history/<int:character_id>', methods=['GET'])
def attendance_history(character_id):
    records = Attendance.query.filter_by(character_id=character_id).order_by(Attendance.date.asc()).all()
    return jsonify({
        'attendance': [r.to_dict() for r in records]
    })


@app.route('/weight/log', methods=['POST'])
def log_weight():
    data = request.json or {}
    character_id = data.get('character_id') or 1
    character = Character.query.get(character_id)
    if not character:
        return jsonify({'error': 'Hunter not found'}), 404

    weight = float(data.get('weight') or 75.0)
    character.current_weight = weight
    
    w_log = WeightLog(character_id=character.id, weight=weight)
    db.session.add(w_log)
    db.session.commit()

    return jsonify({
        'message': f'Weight updated to {weight} kg.',
        'character': character.to_dict()
    })


# ========================
# TASK LOGGING & STREAKS
# ========================

@app.route('/log-task', methods=['POST'])
def log_task():
    """Log a daily task, calculate 5-day streaks, and advance levels"""
    data = request.json or {}
    character_id = data.get('character_id') or 1
    name = data.get('name') or data.get('title') or 'Daily Objective'
    area = data.get('area') or 'fitness'
    description = data.get('description') or name
    difficulty = data.get('difficulty', 'medium')
    
    character = Character.query.get(character_id)
    if not character:
        character = Character.query.first()
        if not character:
            character = Character(name="Sung Jin-Woo")
            db.session.add(character)
            db.session.commit()

    xp_map = {'easy': 15, 'medium': 20, 'hard': 35}
    xp_reward = xp_map.get(difficulty, 20)
    
    task = Task(
        character_id=character.id,
        name=name,
        area=area,
        description=description,
        difficulty=difficulty,
        xp_reward=xp_reward
    )
    db.session.add(task)
    
    today_str = datetime.utcnow().strftime('%Y-%m-%d')
    streak_bonus = 0
    
    if character.last_logged_date:
        try:
            last_dt = datetime.strptime(character.last_logged_date, '%Y-%m-%d')
            today_dt = datetime.strptime(today_str, '%Y-%m-%d')
            diff_days = (today_dt - last_dt).days
            if diff_days == 1:
                character.daily_streak = (character.daily_streak or 0) + 1
                if character.daily_streak % 5 == 0:
                    streak_bonus = 250
            elif diff_days > 1:
                character.daily_streak = 1
        except Exception:
            character.daily_streak = 1
    else:
        character.daily_streak = 1
        
    character.last_logged_date = today_str
    
    total_gained = xp_reward + streak_bonus
    character.current_xp += total_gained
    character.total_xp += total_gained
    
    level_up = False
    req_xp = get_xp_required_for_level(character.level)
    while character.current_xp >= req_xp:
        character.current_xp -= req_xp
        character.level += 1
        character.discipline += 2
        character.focus += 1
        character.strength += 1
        character.endurance += 1
        req_xp = get_xp_required_for_level(character.level)
        level_up = True
    
    db.session.commit()
    
    return jsonify({
        'message': 'Objective confirmed!',
        'xp_gained': total_gained,
        'base_xp': xp_reward,
        'streak_bonus': streak_bonus,
        'daily_streak': character.daily_streak,
        'level_up': level_up,
        'new_level': character.level,
        'rank': get_rank_for_level(character.level),
        'character': character.to_dict()
    }), 201


@app.route('/tasks/<int:character_id>', methods=['GET'])
def get_tasks(character_id):
    character = Character.query.get(character_id)
    if not character:
        return jsonify({'error': 'Character not found'}), 404
    
    tasks = Task.query.filter_by(character_id=character_id).order_by(Task.completed_at.desc()).all()
    return jsonify({
        'character_name': character.name,
        'total_tasks': len(tasks),
        'tasks': [task.to_dict() for task in tasks]
    })


@app.route('/')
def index():
    return render_template('index.html')


# Safe database migration initialization
with app.app_context():
    db.create_all()
    try:
        from sqlalchemy import text
        with db.engine.connect() as conn:
            columns = [
                ("password", "VARCHAR(128) DEFAULT 'hunter123'"),
                ("email", "VARCHAR(120) DEFAULT ''"),
                ("google_id", "VARCHAR(120) DEFAULT ''"),
                ("avatar_url", "VARCHAR(300) DEFAULT ''"),
                ("selected_goals", "TEXT DEFAULT '[\"gym\"]'"),
                ("workout_split", "TEXT DEFAULT '{}'"),
                ("weight_goal_type", "VARCHAR(20) DEFAULT 'maintain'"),
                ("current_weight", "FLOAT DEFAULT 75.0"),
                ("target_weight", "FLOAT DEFAULT 75.0"),
                ("onboarding_completed", "BOOLEAN DEFAULT 0"),
                ("education_level", "VARCHAR(20) DEFAULT 'college'"),
                ("education_detail", "VARCHAR(100) DEFAULT 'B.Tech Computer Science'"),
                ("ecc_skill", "VARCHAR(100) DEFAULT 'Web Development'"),
                ("custom_daily_quests", "TEXT DEFAULT '[]'"),
                ("daily_streak", "INTEGER DEFAULT 0"),
                ("split_streak_21", "INTEGER DEFAULT 0"),
                ("last_logged_date", "VARCHAR(20) DEFAULT ''"),
                ("last_penalty_date", "VARCHAR(20) DEFAULT ''"),
                ("last_logbook_date", "VARCHAR(20) DEFAULT ''"),
                ("last_logbook_penalty_date", "VARCHAR(20) DEFAULT ''")
            ]
            for col_name, col_type in columns:
                try:
                    conn.execute(text(f"ALTER TABLE character ADD COLUMN {col_name} {col_type}"))
                    conn.commit()
                except Exception:
                    pass
    except Exception as e:
        print("Schema migration info:", e)

    if not Character.query.first():
        default_char = Character(name="Sung Jin-Woo", password="hunter123")
        db.session.add(default_char)
        db.session.commit()


if __name__ == '__main__':
    app.run(debug=True, port=5000)
