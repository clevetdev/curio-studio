#!/usr/bin/env bash
# One-time setup: JS deps, Python deps and the free TTS models (all fetched from npm / PyPI / GitHub releases).
set -euo pipefail
cd "$(dirname "$0")/.."
npm install --no-audit --no-fund
pip install -q kokoro-onnx soundfile scipy sherpa-onnx
mkdir -p models/piper
for f in kokoro-v1.0.onnx voices-v1.0.bin; do
  [ -f "models/$f" ] || curl -sSL -o "models/$f" "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/$f"
done
for v in fr_FR-tom-medium fr_FR-upmc-medium fr_FR-siwis-medium; do
  [ -d "models/piper/vits-piper-$v" ] || curl -sSL "https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-$v.tar.bz2" | tar xj -C models/piper
done
echo "Setup OK"
