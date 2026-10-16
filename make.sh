#!/usr/bin/env bash
# Usage : ./make.sh episodes/<slug>   → out/<slug>.mp4
set -euo pipefail
cd "$(dirname "$0")"
slug=$(basename "$1")
# `python3` sous Linux/macOS ; sous Windows (Git Bash) c'est souvent `python`.
PY=$(command -v python3 || command -v python)
"$PY" build_audio.py "$1"
npx remotion render src/index.ts Short "out/$slug.mp4" --codec=h264 --crf=18 --log=error
echo "OK : out/$slug.mp4"
