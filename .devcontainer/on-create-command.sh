#!/bin/bash
set -e
python3 -m venv --upgrade-deps flask-server/.venv --prompt BoilerTrack
. ./flask-server/.venv/bin/activate
pip install -r ./flask-server/requirements.txt
npm i
export BROWSER=none