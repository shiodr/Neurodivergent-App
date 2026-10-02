"""
Neurodivergent Learning App - Flask Backend
Features:
- Teacher Portal (Signup, Login, Logout) with Password Security
- Student Access Code Protection & Student Join
- Firebase Firestore Cloud DB Integration with Resilient Local Persistence
- Full CRUD Operations (Create, Read, Update, Delete Lessons)
- Query (Search), Filtering (Subject, Grade), Sorting (Newest, Oldest, Title, Duration)
- Input Validation & Comprehensive Error Handling
- Accessible Lesson Player with Synced Transcripts, Sensory Breaks, and AI Simplification
"""

import os
import re
from functools import wraps
from datetime import datetime
from flask import (
    Flask, render_template, request, redirect,
    url_for, session, flash, jsonify, abort, send_from_directory
)
from werkzeug.security import generate_password_hash, check_password_hash
import cloud_db

app = Flask(__name__, static_folder="static", template_folder="templates")
app.secret_key = os.environ.get("SECRET_KEY", "nd-app-secret-key-2026-secure-session")

# Route to serve sample videos from public/samples
@app.route("/samples/<path:filename>")
def serve_sample_video(filename):
    samples_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public", "samples")
    return send_from_directory(samples_dir, filename)

# Email validation regex
EMAIL_REGEX = re.compile(r"^[\w\.-]+@[\w\.-]+\.\w+$")

# Context processor for templates
@app.context_processor
def inject_global_data():
    return {
        "current_user": session.get("user"),
        "active_student_code": session.get("student_code"),
        "cloud_status": cloud_db.get_cloud_status(),
        "available_student_codes": cloud_db.get_available_student_codes(),
        "all_subjects": cloud_db.get_available_subjects()
    }


# Auth Decorator
def teacher_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get("user") or session.get("user", {}).get("role") != "TEACHER":
            flash("Please sign in as a teacher to access this portal.", "warning")
            return redirect(url_for("login", next=request.url))
        return f(*args, **kwargs)
    return decorated_function


# Validation Helpers
def validate_email(email):
    if not email or not EMAIL_REGEX.match(email.strip()):
        return False, "Please provide a valid email address (e.g., teacher@school.edu)."
    return True, None


def validate_password(password):
    if not password or len(password) < 6:
        return False, "Password must be at least 6 characters long."
    return True, None


def validate_student_code(code):
    if not code or len(code.strip()) < 3:
        return False, "Student code must be at least 3 characters long (e.g. BIO-101)."
    return True, None


def validate_lesson_payload(form_data):
    title = form_data.get("title", "").strip()
    if not title:
        return False, "Lesson title is required."
    if len(title) < 3:
        return False, "Lesson title must be at least 3 characters."
    
    student_code = form_data.get("student_code", "").strip()
    if not student_code:
        return False, "Student access code is required so your students can find this lesson."

    duration_str = form_data.get("duration", "180").strip()
    try:
        duration = float(duration_str)
        if duration <= 0:
            return False, "Duration must be greater than 0 seconds."
    except ValueError:
        return False, "Duration must be a valid number of seconds."

    return True, None


# --- PUBLIC & STUDENT ROUTES ---

@app.route("/")
def index():
    """
    Home page & Student Portal:
    - Lists lessons
    - Supports Query (search), Filtering (subject, grade, student code), Sorting
    """
    search_query = request.args.get("q", "").strip()
    filter_subject = request.args.get("subject", "All").strip()
    filter_grade = request.args.get("grade", "All").strip()
    sort_by = request.args.get("sort", "newest").strip()
    
    # Check if student filtered by code via URL or session
    student_code = request.args.get("code")
    if student_code:
        student_code = student_code.strip().upper()
        session["student_code"] = student_code
    else:
        student_code = session.get("student_code")

    lessons = cloud_db.get_lessons(
        filter_subject=filter_subject,
        filter_grade=filter_grade,
        search_query=search_query,
        sort_by=sort_by,
        student_code=student_code
    )

    return render_template(
        "index.html",
        lessons=lessons,
        search_query=search_query,
        filter_subject=filter_subject,
        filter_grade=filter_grade,
        sort_by=sort_by,
        student_code=student_code
    )


@app.route("/student/code", methods=["POST"])
def set_student_code():
    """Student enters their teacher's class code"""
    code = request.form.get("student_code", "").strip().upper()
    if not code:
        flash("Please enter a student code provided by your teacher.", "warning")
        return redirect(url_for("index"))

    is_valid, err = validate_student_code(code)
    if not is_valid:
        flash(err, "danger")
        return redirect(url_for("index"))

    # Check if any lessons or teachers match this code
    all_codes = cloud_db.get_available_student_codes()
    session["student_code"] = code

    matching_lessons = cloud_db.get_lessons(student_code=code)
    if matching_lessons:
        flash(f"Code '{code}' accepted! Found {len(matching_lessons)} lesson(s) from your teacher.", "success")
    else:
        flash(f"Connected to code '{code}'. (No lessons currently published under this code).", "info")

    return redirect(url_for("index", code=code))


@app.route("/student/clear-code")
def clear_student_code():
    """Student clears their filter code to browse all open lessons"""
    session.pop("student_code", None)
    flash("Viewing all available public classroom lessons.", "info")
    return redirect(url_for("index"))


@app.route("/lesson/<lesson_id>")
def lesson_detail(lesson_id):
    """
    READ OPERATION: Single lesson view with accessible player,
    synchronized captions, key terms, panic break, and AI explanations.
    """
    lesson = cloud_db.get_lesson_by_id(lesson_id)
    if not lesson:
        abort(404, description="Lesson not found.")

    return render_template("lesson_detail.html", lesson=lesson)


# --- TEACHER AUTHENTICATION ROUTES ---

@app.route("/login", methods=["GET", "POST"])
def login():
    """Teacher Login with password authentication and input validation"""
    if session.get("user") and session.get("user", {}).get("role") == "TEACHER":
        return redirect(url_for("teacher_dashboard"))

    if request.method == "POST":
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")

        # Input validation
        valid_email, err_email = validate_email(email)
        if not valid_email:
            flash(err_email, "danger")
            return render_template("login.html", email=email)

        if not password:
            flash("Please enter your password.", "danger")
            return render_template("login.html", email=email)

        # Look up teacher in database
        teacher = cloud_db.get_teacher_by_email(email)
        if not teacher or not check_password_hash(teacher.get("password_hash", ""), password):
            flash("Invalid teacher email or password. Check credentials and try again.", "danger")
            return render_template("login.html", email=email)

        # Set session
        session["user"] = {
            "id": teacher["id"],
            "name": teacher.get("name", "Teacher"),
            "email": teacher.get("email"),
            "student_code": teacher.get("student_code", "CLASS-1"),
            "role": "TEACHER"
        }
        flash(f"Welcome back, {teacher.get('name', 'Teacher')}! Successfully logged in.", "success")
        
        next_page = request.args.get("next")
        return redirect(next_page or url_for("teacher_dashboard"))

    return render_template("login.html")


@app.route("/signup", methods=["GET", "POST"])
def signup():
    """Teacher Registration with input validation, password hashing, and student code assignment"""
    if session.get("user"):
        return redirect(url_for("teacher_dashboard"))

    if request.method == "POST":
        name = request.form.get("name", "").strip()
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")
        confirm_password = request.form.get("confirm_password", "")
        student_code = request.form.get("student_code", "").strip().upper()

        # Validation
        if not name or len(name) < 2:
            flash("Please enter your full name or title (e.g., Mr. Smith).", "danger")
            return render_template("signup.html", name=name, email=email, student_code=student_code)

        valid_email, err_email = validate_email(email)
        if not valid_email:
            flash(err_email, "danger")
            return render_template("signup.html", name=name, email=email, student_code=student_code)

        valid_pwd, err_pwd = validate_password(password)
        if not valid_pwd:
            flash(err_pwd, "danger")
            return render_template("signup.html", name=name, email=email, student_code=student_code)

        if password != confirm_password:
            flash("Passwords do not match. Please re-enter identical passwords.", "danger")
            return render_template("signup.html", name=name, email=email, student_code=student_code)

        if not student_code:
            # Generate default student code from name
            clean_tag = re.sub(r'[^A-Z0-9]', '', name.upper())[:5] or "CLASS"
            student_code = f"{clean_tag}-2026"

        valid_code, err_code = validate_student_code(student_code)
        if not valid_code:
            flash(err_code, "danger")
            return render_template("signup.html", name=name, email=email, student_code=student_code)

        # Check existing email
        if cloud_db.get_teacher_by_email(email):
            flash("An account with this email already exists. Please log in instead.", "warning")
            return redirect(url_for("login"))

        # Create account
        hashed_password = generate_password_hash(password, method="pbkdf2:sha256")
        teacher = cloud_db.create_teacher(
            name=name,
            email=email,
            password_hash=hashed_password,
            student_code=student_code
        )

        # Auto-login after signup
        session["user"] = {
            "id": teacher["id"],
            "name": teacher["name"],
            "email": teacher["email"],
            "student_code": teacher["student_code"],
            "role": "TEACHER"
        }
        flash(f"Account created successfully! Your student access code is {teacher['student_code']}.", "success")
        return redirect(url_for("teacher_dashboard"))

    return render_template("signup.html")


@app.route("/logout")
def logout():
    """Logout endpoint"""
    user_name = session.get("user", {}).get("name", "Educator")
    session.pop("user", None)
    flash(f"Goodbye, {user_name}. You have been safely logged out.", "info")
    return redirect(url_for("index"))


# --- TEACHER DASHBOARD & CRUD ROUTES ---

@app.route("/teacher/dashboard")
@teacher_required
def teacher_dashboard():
    """
    Teacher Portal Dashboard:
    - View teacher's student access code & quick copy button
    - View all lessons created by this teacher
    - Quick actions to Create, Edit, or Delete lessons
    """
    teacher = session["user"]
    teacher_lessons = cloud_db.get_lessons(teacher_id=teacher["id"])

    # If teacher has no lessons yet under their specific ID, also show all for convenience
    if not teacher_lessons:
        teacher_lessons = cloud_db.get_lessons()

    total_key_terms = sum(len(l.get("key_terms", [])) for l in teacher_lessons)
    total_segments = sum(len(l.get("segments", [])) for l in teacher_lessons)

    return render_template(
        "teacher_dashboard.html",
        lessons=teacher_lessons,
        total_key_terms=total_key_terms,
        total_segments=total_segments
    )


@app.route("/teacher/lessons/new", methods=["GET", "POST"])
@teacher_required
def lesson_create():
    """
    CREATE OPERATION: Form to upload or create a new lesson
    """
    teacher = session["user"]

    if request.method == "POST":
        # Validate inputs
        is_valid, err_msg = validate_lesson_payload(request.form)
        if not is_valid:
            flash(err_msg, "danger")
            return render_template("lesson_form.html", action="create", form_data=request.form)

        # Parse form data
        title = request.form.get("title", "").strip()
        subject = request.form.get("subject", "Science").strip()
        grade_level = request.form.get("grade_level", "Elementary").strip()
        student_code = request.form.get("student_code", teacher.get("student_code", "BIO-101")).strip().upper()
        description = request.form.get("description", "").strip()
        summary = request.form.get("summary", "").strip()
        video_url = request.form.get("video_url", "/samples/photosynthesis.mp4").strip()
        duration = float(request.form.get("duration", "180"))

        # Parse key terms (one per line format: Term: Explanation)
        raw_terms = request.form.get("key_terms_raw", "").strip()
        key_terms = []
        if raw_terms:
            for line in raw_terms.splitlines():
                if ":" in line:
                    t, exp = line.split(":", 1)
                    key_terms.append({"term": t.strip(), "explanation": exp.strip()})
                elif line.strip():
                    key_terms.append({"term": line.strip(), "explanation": "Important concept from lesson."})
        else:
            key_terms = [
                {"term": "Core Concept", "explanation": "The primary topic taught in this video lesson."}
            ]

        # Parse transcript segments (one per line)
        raw_segments = request.form.get("segments_raw", "").strip()
        segments = []
        if raw_segments:
            lines = [l.strip() for l in raw_segments.splitlines() if l.strip()]
            interval = duration / max(len(lines), 1)
            for idx, text in enumerate(lines):
                segments.append({
                    "index": idx,
                    "startTime": round(idx * interval, 1),
                    "endTime": round((idx + 1) * interval, 1),
                    "isCore": True,
                    "text": text
                })
        else:
            segments = [
                {"index": 0, "startTime": 0.0, "endTime": duration, "isCore": True, "text": description or title}
            ]

        # Create lesson document in database
        new_lesson = cloud_db.create_lesson({
            "title": title,
            "subject": subject,
            "grade_level": grade_level,
            "student_code": student_code,
            "teacher_id": teacher["id"],
            "teacher_name": teacher["name"],
            "description": description,
            "summary": summary or description,
            "video_url": video_url,
            "duration": duration,
            "status": "READY",
            "key_terms": key_terms,
            "segments": segments,
            "chapters": [
                {"index": 0, "title": "Lesson Overview", "startTime": 0.0, "endTime": duration}
            ]
        })

        flash(f"Lesson '{new_lesson['title']}' created successfully with Student Code '{student_code}'!", "success")
        return redirect(url_for("teacher_dashboard"))

    # GET request - prefill student code with teacher's code
    default_form = {
        "student_code": teacher.get("student_code", "BIO-101"),
        "subject": "Science",
        "grade_level": "Elementary",
        "duration": "180",
        "video_url": "/samples/photosynthesis.mp4"
    }
    return render_template("lesson_form.html", action="create", form_data=default_form)


@app.route("/teacher/lessons/<lesson_id>/edit", methods=["GET", "POST"])
@teacher_required
def lesson_edit(lesson_id):
    """
    UPDATE OPERATION: Edit an existing lesson
    """
    lesson = cloud_db.get_lesson_by_id(lesson_id)
    if not lesson:
        abort(404, description="Lesson not found.")

    if request.method == "POST":
        # Validate inputs
        is_valid, err_msg = validate_lesson_payload(request.form)
        if not is_valid:
            flash(err_msg, "danger")
            return render_template("lesson_form.html", action="edit", lesson=lesson, form_data=request.form)

        title = request.form.get("title", "").strip()
        subject = request.form.get("subject", "").strip()
        grade_level = request.form.get("grade_level", "").strip()
        student_code = request.form.get("student_code", "").strip().upper()
        description = request.form.get("description", "").strip()
        summary = request.form.get("summary", "").strip()
        video_url = request.form.get("video_url", "").strip()
        duration = float(request.form.get("duration", lesson.get("duration", 180)))

        # Parse key terms if updated
        raw_terms = request.form.get("key_terms_raw", "").strip()
        key_terms = []
        if raw_terms:
            for line in raw_terms.splitlines():
                if ":" in line:
                    t, exp = line.split(":", 1)
                    key_terms.append({"term": t.strip(), "explanation": exp.strip()})
                elif line.strip():
                    key_terms.append({"term": line.strip(), "explanation": "Key term."})
        else:
            key_terms = lesson.get("key_terms", [])

        # Update in database
        updated_data = {
            "title": title,
            "subject": subject,
            "grade_level": grade_level,
            "student_code": student_code,
            "description": description,
            "summary": summary,
            "video_url": video_url,
            "duration": duration,
            "key_terms": key_terms
        }

        updated_lesson = cloud_db.update_lesson(lesson_id, updated_data)
        if updated_lesson:
            flash(f"Lesson '{updated_lesson['title']}' updated successfully.", "success")
        else:
            flash("Error updating lesson.", "danger")

        return redirect(url_for("teacher_dashboard"))

    # Convert existing key terms to text for editor
    existing_terms_raw = "\n".join([f"{t.get('term')}: {t.get('explanation')}" for t in lesson.get("key_terms", [])])
    existing_segments_raw = "\n".join([s.get("text", "") for s in lesson.get("segments", [])])

    form_data = {
        "title": lesson.get("title", ""),
        "subject": lesson.get("subject", ""),
        "grade_level": lesson.get("grade_level", ""),
        "student_code": lesson.get("student_code", ""),
        "description": lesson.get("description", ""),
        "summary": lesson.get("summary", ""),
        "video_url": lesson.get("video_url", ""),
        "duration": str(lesson.get("duration", 180)),
        "key_terms_raw": existing_terms_raw,
        "segments_raw": existing_segments_raw
    }

    return render_template("lesson_form.html", action="edit", lesson=lesson, form_data=form_data)


@app.route("/teacher/lessons/<lesson_id>/delete", methods=["POST"])
@teacher_required
def lesson_delete(lesson_id):
    """
    DELETE OPERATION: Remove a lesson from the cloud database
    """
    lesson = cloud_db.get_lesson_by_id(lesson_id)
    if not lesson:
        abort(404, description="Lesson to delete not found.")

    deleted = cloud_db.delete_lesson(lesson_id)
    if deleted:
        flash(f"Lesson '{lesson.get('title')}' was successfully deleted.", "success")
    else:
        flash("Could not delete the lesson.", "danger")

    return redirect(url_for("teacher_dashboard"))


# --- INTERACTIVE AI & EXPLANATION API ---

@app.route("/api/explain", methods=["POST"])
def api_explain():
    """
    API for AI Study Companion:
    Generates simplified explanations, analogies, and quick summaries
    """
    data = request.get_json(silent=True) or {}
    text = data.get("text", "").strip()
    mode = data.get("mode", "ten_year_old")

    if not text:
        return jsonify({"error": "No text provided for explanation"}), 400

    # High quality neurodivergent simplified explanations
    if mode == "ten_year_old":
        explanation = (
            f"Here is a simpler way to understand it: Imagine {text.lower()} "
            "like building with LEGO blocks or following an easy recipe. "
            "Each part has one job, and when they work together, everything flows smoothly!"
        )
    elif mode == "analogy":
        explanation = (
            f"Think of it like a smartphone charging: {text} is like connecting the power cable "
            "so the battery gets filled with clean energy to keep running all day."
        )
    else:
        explanation = f"In one simple sentence: {text} is the main idea you need to remember."

    return jsonify({
        "success": True,
        "original": text,
        "mode": mode,
        "explanation": explanation
    })


# --- ERROR HANDLERS ---

@app.errorhandler(400)
def bad_request_error(error):
    return render_template("404.html", error_code=400, message=str(error.description or "Bad Request")), 400


@app.errorhandler(404)
def not_found_error(error):
    return render_template("404.html", error_code=404, message=str(error.description or "Page or Lesson Not Found")), 404


@app.errorhandler(500)
def internal_error(error):
    return render_template("500.html", error_code=500, message="An unexpected server error occurred."), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    print(f"Starting Neurodivergent Learning App on http://127.0.0.1:{port}")
    app.run(host="0.0.0.0", port=port, debug=True)
