"""
Cloud Database Integration with Firebase Firestore and Resilient Local Fallback
Project: neurodivergent-app-15a25
"""

import os
import json
import uuid
import time
import requests
from datetime import datetime
from werkzeug.security import generate_password_hash

# Firebase Configuration
FIREBASE_PROJECT_ID = os.environ.get("FIREBASE_PROJECT_ID", "neurodivergent-app-15a25")
FIREBASE_API_KEY = os.environ.get("FIREBASE_API_KEY", "AIzaSyDxVb9pD2outFE7yO6fd8vBSM61qh_0qWk")
FIRESTORE_BASE_URL = f"https://firestore.googleapis.com/v1/projects/{FIREBASE_PROJECT_ID}/databases/(default)/documents"

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
LOCAL_DB_FILE = os.path.join(DATA_DIR, "app_data.json")

# State tracker for cloud connectivity
CLOUD_STATUS = {
    "provider": "Firebase Firestore",
    "project_id": FIREBASE_PROJECT_ID,
    "connected": False,
    "last_check": None,
    "notice": "Initializing..."
}


def _ensure_data_dir():
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR, exist_ok=True)


def _get_default_seed():
    """Initial seed data for teachers and lessons"""
    teacher_id = "teacher_default_1"
    hashed_pwd = generate_password_hash("teacher123", method="pbkdf2:sha256")
    
    teachers = {
        teacher_id: {
            "id": teacher_id,
            "name": "Ms. Henderson",
            "email": "teacher@school.edu",
            "password_hash": hashed_pwd,
            "student_code": "BIO-101",
            "created_at": "2026-09-01T08:00:00Z"
        }
    }

    lessons = {
        "lesson_photosynthesis": {
            "id": "lesson_photosynthesis",
            "title": "Introduction to Photosynthesis: How Plants Make Food",
            "subject": "Science",
            "grade_level": "Elementary",
            "student_code": "BIO-101",
            "teacher_id": teacher_id,
            "teacher_name": "Ms. Henderson",
            "description": "A gentle, step-by-step introduction to how green plants turn sunlight, water, and air into energy and oxygen.",
            "summary": "Plants create their own food through photosynthesis using sunlight, water, and carbon dioxide. Inside leaf cells, chloroplasts trap light to produce energy-rich glucose and release clean oxygen into the air.",
            "video_url": "/samples/photosynthesis.mp4",
            "duration": 180.0,
            "status": "READY",
            "created_at": "2026-09-10T10:00:00Z",
            "updated_at": "2026-09-10T10:00:00Z",
            "chapters": [
                {"index": 0, "title": "Introduction to Plant Food", "startTime": 0.0, "endTime": 38.0},
                {"index": 1, "title": "Inside Plant Cells: Chloroplasts", "startTime": 38.0, "endTime": 62.0},
                {"index": 2, "title": "Absorbing Water & Carbon Dioxide", "startTime": 62.0, "endTime": 95.0},
                {"index": 3, "title": "The Chemical Recipe: Glucose & Oxygen", "startTime": 95.0, "endTime": 158.0},
                {"index": 4, "title": "Review & Wrap Up", "startTime": 158.0, "endTime": 180.0}
            ],
            "key_terms": [
                {"term": "Photosynthesis", "explanation": "The way green plants make food using sunlight, water, and air. 'Photo' means light, 'synthesis' means putting together."},
                {"term": "Chlorophyll", "explanation": "The natural green pigment inside leaves that catches sunlight like a tiny solar panel."},
                {"term": "Chloroplasts", "explanation": "Tiny factory compartments inside plant cells where photosynthesis takes place."},
                {"term": "Stomata", "explanation": "Microscopic pores on leaf undersides that open and close to breathe in carbon dioxide and release oxygen."},
                {"term": "Glucose", "explanation": "A natural simple sugar that plants make for energy and growth."},
                {"term": "Carbon Dioxide", "explanation": "An invisible gas that humans breathe out, and plants take in to power photosynthesis."}
            ],
            "segments": [
                {"index": 0, "startTime": 0.0, "endTime": 18.5, "isCore": True, "text": "Welcome everyone! Today we are exploring photosynthesis, which is the wonderful process plants use to make their own food."},
                {"index": 1, "startTime": 18.5, "endTime": 38.0, "isCore": False, "text": "Unlike animals who eat food from outside, plants are autotrophs. That means they produce their own energy right inside their green leaves."},
                {"index": 2, "startTime": 38.0, "endTime": 62.0, "isCore": True, "text": "Inside plant cells are tiny solar panels called chloroplasts. These contain chlorophyll, the green pigment that traps sunlight."},
                {"index": 3, "startTime": 62.0, "endTime": 95.0, "isCore": True, "text": "Plants absorb water through their roots from the soil, and they take in carbon dioxide gas from the air through microscopic openings called stomata."},
                {"index": 4, "startTime": 95.0, "endTime": 130.0, "isCore": True, "text": "When sunlight hits the chlorophyll, a chemical reaction combines water and carbon dioxide to create glucose, a simple sugar used for energy."},
                {"index": 5, "startTime": 130.0, "endTime": 158.0, "isCore": False, "text": "As a marvelous bonus for us and all living creatures, this process releases pure oxygen into the atmosphere for us to breathe."},
                {"index": 6, "startTime": 158.0, "endTime": 180.0, "isCore": True, "text": "So to review the recipe: sunlight plus water plus carbon dioxide gives the plant glucose for food, and gives the world oxygen. Great job today!"}
            ],
            "practice_questions": [
                {"question": "What is the green pigment in leaves that traps sunlight?", "answer": "Chlorophyll", "hint": "It makes leaves look green.", "options": ["Chlorophyll", "Glucose", "Stomata", "Oxygen"]},
                {"question": "What simple sugar do plants make for food and energy?", "answer": "Glucose", "hint": "A sweet substance that powers the plant cells.", "options": ["Carbon dioxide", "Water", "Glucose", "Sunlight"]},
                {"question": "What gas do plants release into the air for humans to breathe?", "answer": "Oxygen", "hint": "The fresh air you take in every breath.", "options": ["Oxygen", "Carbon dioxide", "Nitrogen", "Helium"]}
            ]
        },
        "lesson_water_cycle": {
            "id": "lesson_water_cycle",
            "title": "The Water Cycle: Earth's Natural Recycling System",
            "subject": "Science",
            "grade_level": "Elementary",
            "student_code": "EARTH-2026",
            "teacher_id": teacher_id,
            "teacher_name": "Ms. Henderson",
            "description": "Discover how water moves constantly across our planet through evaporation, condensation, precipitation, and collection.",
            "summary": "The water cycle is Earth's infinite recycling journey. Sunlight powers evaporation and transpiration to lift vapor into the sky, where it cools into clouds through condensation and falls back as rain or snow.",
            "video_url": "/samples/water-cycle.mp4",
            "duration": 150.0,
            "status": "READY",
            "created_at": "2026-09-12T11:30:00Z",
            "updated_at": "2026-09-12T11:30:00Z",
            "chapters": [
                {"index": 0, "title": "Earth's Ancient Water", "startTime": 0.0, "endTime": 22.0},
                {"index": 1, "title": "Evaporation: Rising to the Sky", "startTime": 22.0, "endTime": 54.0},
                {"index": 2, "title": "Transpiration: Plants Give Moisture", "startTime": 54.0, "endTime": 85.0},
                {"index": 3, "title": "Condensation: Making Clouds", "startTime": 85.0, "endTime": 115.0},
                {"index": 4, "title": "Precipitation: Rain & Snow Return", "startTime": 115.0, "endTime": 150.0}
            ],
            "key_terms": [
                {"term": "Evaporation", "explanation": "When the sun heats up liquid water and turns it into invisible gas (water vapor) that floats into the sky."},
                {"term": "Transpiration", "explanation": "Plants 'sweating' water vapor out from their leaf pores into the air."},
                {"term": "Condensation", "explanation": "When cool air causes water vapor to turn back into tiny liquid droplets that form clouds."},
                {"term": "Precipitation", "explanation": "Water falling from clouds back to Earth as rain, snow, sleet, or hail."}
            ],
            "segments": [
                {"index": 0, "startTime": 0.0, "endTime": 22.0, "isCore": False, "text": "Hello learners! Did you know the water you drank today might be the same water a dinosaur drank millions of years ago? This is because of the water cycle."},
                {"index": 1, "startTime": 22.0, "endTime": 54.0, "isCore": True, "text": "First is evaporation. The sun warms lakes, rivers, and oceans, turning liquid water into invisible water vapor that floats up into the sky."},
                {"index": 2, "startTime": 54.0, "endTime": 85.0, "isCore": True, "text": "Plants also release water vapor from their leaves in a process called transpiration, adding even more moisture to the air."},
                {"index": 3, "startTime": 85.0, "endTime": 115.0, "isCore": True, "text": "High in the cold sky, condensation happens. The water vapor cools down and clumps together onto tiny dust specks to form fluffy clouds."},
                {"index": 4, "startTime": 115.0, "endTime": 150.0, "isCore": True, "text": "When the clouds become too heavy, precipitation falls down as rain, snow, sleet, or hail, replenishing our rivers and starting the cycle again."}
            ],
            "practice_questions": [
                {"question": "What turns liquid water into invisible vapor that rises into the sky?", "answer": "Evaporation", "hint": "The sun provides the warmth for this step.", "options": ["Evaporation", "Precipitation", "Freezing", "Melting"]},
                {"question": "What is the term for water vapor released by plant leaves?", "answer": "Transpiration", "hint": "Think of it as plants sweating moisture.", "options": ["Transpiration", "Condensation", "Photosynthesis", "Respiration"]},
                {"question": "What happens during condensation?", "answer": "Water vapor cools down and forms clouds", "hint": "Cool air causes droplets to gather together.", "options": ["Water vapor cools down and forms clouds", "Rain falls to the ground", "The sun boils water away", "Water seeps into deep soil"]}
            ]
        },
        "lesson_fractions": {
            "id": "lesson_fractions",
            "title": "Understanding Fractions: Parts of a Whole",
            "subject": "Mathematics",
            "grade_level": "Elementary",
            "student_code": "MATH-5A",
            "teacher_id": teacher_id,
            "teacher_name": "Ms. Henderson",
            "description": "Learn how equal shares create halves, thirds, and quarters with visual pizza and chocolate bar models.",
            "summary": "Fractions represent parts of an equal whole. The numerator (top number) counts how many parts you have, while the denominator (bottom number) shows how many equal parts make the whole.",
            "video_url": "/samples/photosynthesis.mp4",
            "duration": 120.0,
            "status": "READY",
            "created_at": "2026-09-15T09:15:00Z",
            "updated_at": "2026-09-15T09:15:00Z",
            "chapters": [
                {"index": 0, "title": "What is a Fraction?", "startTime": 0.0, "endTime": 30.0},
                {"index": 1, "title": "Numerator vs Denominator", "startTime": 30.0, "endTime": 70.0},
                {"index": 2, "title": "Equal Slices & Sharing", "startTime": 70.0, "endTime": 120.0}
            ],
            "key_terms": [
                {"term": "Numerator", "explanation": "The top number in a fraction that tells how many pieces you have."},
                {"term": "Denominator", "explanation": "The bottom number in a fraction that tells the total number of equal pieces in the whole thing."},
                {"term": "Equivalent Fractions", "explanation": "Different fractions that name the exact same amount, like 1/2 and 2/4."}
            ],
            "segments": [
                {"index": 0, "startTime": 0.0, "endTime": 30.0, "isCore": True, "text": "Welcome mathematicians! Today we are learning about fractions by sharing pizzas and cookies into equal parts."},
                {"index": 1, "startTime": 30.0, "endTime": 70.0, "isCore": True, "text": "A fraction has two numbers. The top is the numerator, telling how many slices you take. The bottom is the denominator, showing all slices combined."},
                {"index": 2, "startTime": 70.0, "endTime": 120.0, "isCore": True, "text": "If a pizza has 4 equal slices and you eat 1 slice, you ate 1 over 4, or one quarter of the pizza!"}
            ],
            "practice_questions": [
                {"question": "In the fraction 3/4, what number is the denominator?", "answer": "4", "hint": "The denominator is the bottom number.", "options": ["4", "3", "7", "1"]},
                {"question": "If you cut an apple into 2 equal pieces and eat 1, what fraction did you eat?", "answer": "1/2", "hint": "One piece out of two total pieces.", "options": ["1/2", "2/1", "1/4", "3/4"]}
            ]
        },
        "lesson_cellular_respiration": {
            "id": "lesson_cellular_respiration",
            "title": "Cellular Respiration and Energy Transfer",
            "subject": "Science",
            "grade_level": "High School",
            "student_code": "BIO-101",
            "teacher_id": teacher_id,
            "teacher_name": "Ms. Henderson",
            "description": "Examine how cells break down glucose molecules to synthesize ATP energy in mitochondria.",
            "summary": "Cellular respiration converts biochemical energy from nutrients into ATP, releasing metabolic waste products like carbon dioxide and water.",
            "video_url": "/samples/photosynthesis.mp4",
            "duration": 210.0,
            "status": "READY",
            "created_at": "2026-09-18T14:00:00Z",
            "updated_at": "2026-09-18T14:00:00Z",
            "chapters": [
                {"index": 0, "title": "Glycolysis in the Cytoplasm", "startTime": 0.0, "endTime": 60.0},
                {"index": 1, "title": "The Krebs Cycle", "startTime": 60.0, "endTime": 130.0},
                {"index": 2, "title": "Electron Transport Chain & ATP", "startTime": 130.0, "endTime": 210.0}
            ],
            "key_terms": [
                {"term": "Mitochondria", "explanation": "The powerhouse organelle in cells where respiration generates ATP."},
                {"term": "ATP (Adenosine Triphosphate)", "explanation": "The primary energy currency used by cells to do mechanical, chemical, and transport work."}
            ],
            "segments": [
                {"index": 0, "startTime": 0.0, "endTime": 60.0, "isCore": True, "text": "Welcome high school biology students. Today we analyze cellular respiration and how chemical bonds yield ATP energy."},
                {"index": 1, "startTime": 60.0, "endTime": 130.0, "isCore": True, "text": "Glycolysis splits glucose into pyruvate, which then enters the mitochondria to fuel the citric acid cycle."},
                {"index": 2, "startTime": 130.0, "endTime": 210.0, "isCore": True, "text": "Finally, the electron transport chain produces the vast majority of cellular ATP via oxidative phosphorylation."}
            ],
            "practice_questions": [
                {"question": "What molecule is known as the cellular energy currency?", "answer": "ATP", "hint": "Three letters standing for Adenosine Triphosphate.", "options": ["ATP", "DNA", "RNA", "Glucose"]}
            ]
        }
    }

    return {"teachers": teachers, "lessons": lessons}


def _load_local_db():
    _ensure_data_dir()
    if not os.path.exists(LOCAL_DB_FILE):
        data = _get_default_seed()
        _save_local_db(data)
        return data
    try:
        with open(LOCAL_DB_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        data = _get_default_seed()
        _save_local_db(data)
        return data


def _save_local_db(data):
    _ensure_data_dir()
    with open(LOCAL_DB_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


# --- Firestore REST API Helpers ---

def _python_to_firestore_value(val):
    """Converts Python value to Firestore REST API value format"""
    if val is None:
        return {"nullValue": None}
    elif isinstance(val, bool):
        return {"booleanValue": val}
    elif isinstance(val, int):
        return {"integerValue": str(val)}
    elif isinstance(val, float):
        return {"doubleValue": val}
    elif isinstance(val, str):
        return {"stringValue": val}
    elif isinstance(val, list):
        return {"arrayValue": {"values": [_python_to_firestore_value(item) for item in val]}}
    elif isinstance(val, dict):
        return {"mapValue": {"fields": {k: _python_to_firestore_value(v) for k, v in val.items()}}}
    return {"stringValue": str(val)}


def _firestore_value_to_python(f_val):
    """Converts Firestore REST API value format to Python value"""
    if not isinstance(f_val, dict):
        return f_val
    if "stringValue" in f_val:
        return f_val["stringValue"]
    if "booleanValue" in f_val:
        return f_val["booleanValue"]
    if "integerValue" in f_val:
        return int(f_val["integerValue"])
    if "doubleValue" in f_val:
        return float(f_val["doubleValue"])
    if "nullValue" in f_val:
        return None
    if "arrayValue" in f_val:
        values = f_val["arrayValue"].get("values", [])
        return [_firestore_value_to_python(v) for v in values]
    if "mapValue" in f_val:
        fields = f_val["mapValue"].get("fields", {})
        return {k: _firestore_value_to_python(v) for k, v in fields.items()}
    return None


def _firestore_doc_to_dict(doc):
    fields = doc.get("fields", {})
    res = {}
    for k, v in fields.items():
        res[k] = _firestore_value_to_python(v)
    if "name" in doc:
        res["_firestore_id"] = doc["name"].split("/")[-1]
    return res


def _dict_to_firestore_doc(d):
    fields = {}
    for k, v in d.items():
        if k.startswith("_"):
            continue
        fields[k] = _python_to_firestore_value(v)
    return {"fields": fields}


def _try_firestore_request(method, path, data=None):
    """Attempts a Firestore REST call; returns (success, response_json_or_error)"""
    url = f"{FIRESTORE_BASE_URL}/{path}"
    headers = {"Content-Type": "application/json"}
    params = {"key": FIREBASE_API_KEY}
    
    try:
        if method == "GET":
            r = requests.get(url, params=params, headers=headers, timeout=3)
        elif method == "POST":
            r = requests.post(url, params=params, headers=headers, json=data, timeout=3)
        elif method == "PATCH":
            r = requests.patch(url, params=params, headers=headers, json=data, timeout=3)
        elif method == "DELETE":
            r = requests.delete(url, params=params, headers=headers, timeout=3)
        else:
            return False, "Unsupported method"
        
        if r.status_code in (200, 201):
            CLOUD_STATUS["connected"] = True
            CLOUD_STATUS["notice"] = "Connected to Firebase Firestore Cloud DB"
            return True, r.json() if r.text else {}
        else:
            CLOUD_STATUS["connected"] = False
            CLOUD_STATUS["notice"] = f"Cloud DB standby ({r.status_code}): using resilient local persistence"
            return False, r.text
    except Exception as e:
        CLOUD_STATUS["connected"] = False
        CLOUD_STATUS["notice"] = f"Cloud DB offline: using resilient local persistence"
        return False, str(e)


# --- Public Database Operations ---

def get_cloud_status():
    """Returns database connection status for UI display"""
    return CLOUD_STATUS


# 1. TEACHER AUTHENTICATION OPERATIONS

def create_teacher(name, email, password_hash, student_code):
    """Creates a new teacher account"""
    teacher_id = "teacher_" + uuid.uuid4().hex[:10]
    teacher_data = {
        "id": teacher_id,
        "name": name.strip(),
        "email": email.strip().lower(),
        "password_hash": password_hash,
        "student_code": student_code.strip().upper(),
        "created_at": datetime.utcnow().isoformat() + "Z"
    }

    # Attempt cloud save
    doc_payload = _dict_to_firestore_doc(teacher_data)
    _try_firestore_request("POST", f"teachers?documentId={teacher_id}", doc_payload)

    # Always persist locally for consistency
    local_data = _load_local_db()
    local_data["teachers"][teacher_id] = teacher_data
    _save_local_db(local_data)
    return teacher_data


def get_teacher_by_email(email):
    """Finds a teacher by email"""
    clean_email = email.strip().lower()
    local_data = _load_local_db()
    for t in local_data["teachers"].values():
        if t.get("email", "").lower() == clean_email:
            return t
    return None


def get_teacher_by_id(teacher_id):
    """Finds teacher by ID"""
    local_data = _load_local_db()
    return local_data["teachers"].get(teacher_id)


# 2. LESSON CRUD OPERATIONS

def create_lesson(lesson_dict):
    """
    CREATE OPERATION: Creates a new lesson
    """
    lesson_id = lesson_dict.get("id") or ("lesson_" + uuid.uuid4().hex[:10])
    now_str = datetime.utcnow().isoformat() + "Z"

    lesson = {
        "id": lesson_id,
        "title": lesson_dict.get("title", "").strip(),
        "subject": lesson_dict.get("subject", "General").strip(),
        "grade_level": lesson_dict.get("grade_level", "General").strip(),
        "student_code": lesson_dict.get("student_code", "CLASS-1").strip().upper(),
        "teacher_id": lesson_dict.get("teacher_id", "teacher_default_1"),
        "teacher_name": lesson_dict.get("teacher_name", "Teacher"),
        "description": lesson_dict.get("description", "").strip(),
        "summary": lesson_dict.get("summary", "").strip(),
        "video_url": lesson_dict.get("video_url", "/samples/photosynthesis.mp4").strip(),
        "duration": float(lesson_dict.get("duration", 180.0)),
        "status": lesson_dict.get("status", "READY"),
        "created_at": lesson_dict.get("created_at", now_str),
        "updated_at": now_str,
        "chapters": lesson_dict.get("chapters", []),
        "key_terms": lesson_dict.get("key_terms", []),
        "segments": lesson_dict.get("segments", []),
        "practice_questions": lesson_dict.get("practice_questions", [])
    }

    # Attempt cloud save to Firestore
    doc_payload = _dict_to_firestore_doc(lesson)
    _try_firestore_request("POST", f"lessons?documentId={lesson_id}", doc_payload)

    # Persist locally
    local_data = _load_local_db()
    local_data["lessons"][lesson_id] = lesson
    _save_local_db(local_data)
    return lesson


def get_lesson_by_id(lesson_id):
    """
    READ OPERATION: Fetches a single lesson by ID
    """
    local_data = _load_local_db()
    if lesson_id in local_data["lessons"]:
        return local_data["lessons"][lesson_id]

    # Try Firestore
    success, res = _try_firestore_request("GET", f"lessons/{lesson_id}")
    if success and isinstance(res, dict):
        return _firestore_doc_to_dict(res)
    return None


def update_lesson(lesson_id, updated_fields):
    """
    UPDATE OPERATION: Updates an existing lesson
    """
    local_data = _load_local_db()
    if lesson_id not in local_data["lessons"]:
        return None

    lesson = local_data["lessons"][lesson_id]
    for key, value in updated_fields.items():
        if key != "id":
            lesson[key] = value
    lesson["updated_at"] = datetime.utcnow().isoformat() + "Z"

    # Attempt Firestore PATCH
    doc_payload = _dict_to_firestore_doc(lesson)
    _try_firestore_request("PATCH", f"lessons/{lesson_id}", doc_payload)

    # Save locally
    local_data["lessons"][lesson_id] = lesson
    _save_local_db(local_data)
    return lesson


def delete_lesson(lesson_id):
    """
    DELETE OPERATION: Deletes a lesson
    """
    local_data = _load_local_db()
    deleted = False
    if lesson_id in local_data["lessons"]:
        del local_data["lessons"][lesson_id]
        _save_local_db(local_data)
        deleted = True

    # Attempt Firestore DELETE
    _try_firestore_request("DELETE", f"lessons/{lesson_id}")
    return deleted


# 3. QUERY, FILTERING, SORTING OPERATIONS

def get_lessons(filter_subject=None, filter_grade=None, search_query=None, sort_by="newest", student_code=None, teacher_id=None):
    """
    READ, QUERY, FILTERING, SORTING
    Supports:
    - Query (search_query matching title, description, or key terms)
    - Filtering (filter_subject, filter_grade, student_code, teacher_id)
    - Sorting (newest, oldest, title_asc, title_desc, duration_asc, duration_desc)
    """
    local_data = _load_local_db()
    all_lessons = list(local_data["lessons"].values())

    # 1. Filter by Teacher ID (for teacher dashboard)
    if teacher_id:
        all_lessons = [l for l in all_lessons if l.get("teacher_id") == teacher_id]

    # 2. Filter by Student Code
    if student_code:
        code_upper = student_code.strip().upper()
        all_lessons = [l for l in all_lessons if l.get("student_code", "").upper() == code_upper]

    # 3. Filter by Subject
    if filter_subject and filter_subject.lower() != "all":
        all_lessons = [l for l in all_lessons if l.get("subject", "").lower() == filter_subject.lower()]

    # 4. Filter by Grade Level
    if filter_grade and filter_grade.lower() != "all":
        all_lessons = [l for l in all_lessons if l.get("grade_level", "").lower() == filter_grade.lower()]

    # 5. Search Query (Keyword search in title, description, key terms, or student code)
    if search_query:
        q = search_query.strip().lower()
        matched = []
        for l in all_lessons:
            title = l.get("title", "").lower()
            desc = l.get("description", "").lower()
            code = l.get("student_code", "").lower()
            terms = " ".join([t.get("term", "").lower() for t in l.get("key_terms", [])])
            if q in title or q in desc or q in code or q in terms:
                matched.append(l)
        all_lessons = matched

    # 6. Sorting
    if sort_by == "oldest":
        all_lessons.sort(key=lambda x: x.get("created_at", ""))
    elif sort_by == "title_asc":
        all_lessons.sort(key=lambda x: x.get("title", "").lower())
    elif sort_by == "title_desc":
        all_lessons.sort(key=lambda x: x.get("title", "").lower(), reverse=True)
    elif sort_by == "duration_asc":
        all_lessons.sort(key=lambda x: float(x.get("duration", 0)))
    elif sort_by == "duration_desc":
        all_lessons.sort(key=lambda x: float(x.get("duration", 0)), reverse=True)
    else:  # default: newest
        all_lessons.sort(key=lambda x: x.get("created_at", ""), reverse=True)

    return all_lessons


def get_available_student_codes():
    """Returns unique list of active student codes across lessons and teachers"""
    local_data = _load_local_db()
    codes = set()
    for t in local_data["teachers"].values():
        if t.get("student_code"):
            codes.add(t["student_code"].upper())
    for l in local_data["lessons"].values():
        if l.get("student_code"):
            codes.add(l["student_code"].upper())
    return sorted(list(codes))


def get_available_subjects():
    """Returns unique list of subjects for filter dropdown"""
    local_data = _load_local_db()
    subjects = set(["Science", "Mathematics", "English", "History", "Art"])
    for l in local_data["lessons"].values():
        if l.get("subject"):
            subjects.add(l["subject"].capitalize())
    return sorted(list(subjects))
