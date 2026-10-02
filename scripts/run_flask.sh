#!/usr/bin/env bash
# Quick run script for Neurodivergent Learning App (Flask)
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR"

if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    ./venv/bin/pip install -r requirements.txt
fi

echo "Starting Flask Server on http://127.0.0.1:5001 ..."
export PORT=5001
export FLASK_APP=app.py
export FLASK_ENV=development
./venv/bin/python3 app.py
