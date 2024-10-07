#!/bin/bash
set -e
python3 -m venv --upgrade-deps backend/.venv --prompt BoilerTrack
. ./backend/.venv/bin/activate
pip install -r ./flask-server/requirements.txt
npm i
