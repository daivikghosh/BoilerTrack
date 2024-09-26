#!/bin/bash
set -e
python3 -m venv --upgrade-deps .venv --prompt BoilerTrack
. ./.venv/bin/activate
pip install -r requirements.txt
