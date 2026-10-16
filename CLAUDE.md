# CURIO studio

Fully generated vertical science shorts (1080×1920, ~50 s, French). Brand: "CURIO — la science en 1 minute", mascot Lumi (a photon).

- First run in a fresh container: `./scripts/setup.sh`, then `./make.sh episodes/<slug>`.
- `episodes/<slug>/script.json`: one entry per scene → `visual` (key in `SCENES`, src/scenes.tsx), `text` (voice-over), `beats` (spoken words that trigger animations and pop SFX; `word#2` = 2nd occurrence).
- `build_audio.py`: TTS (Kokoro or Piper via sherpa-onnx), voice FX, procedural music with ducking, SFX, -14 LUFS, writes `public/audio.wav` + `public/timeline.json` (word-level timings).
- Remotion: `src/brand.tsx` (palette, fonts, Lumi, helpers `useBeat/useBeatPop/useRamp`), `src/scenes.tsx`, `src/Video.tsx` (captions, transitions, progress bar).
- Network: Hugging Face is blocked here; models come from GitHub releases.
- Review renders by extracting frames with ffmpeg; nobody can listen in the container, so audio choices need the user's ears.
- Scripts must be fact-checked; content is in French.

## Git
- Commit identity: `clevetdev <corentin.levet@epitech.eu>` (set it with `git config user.name/user.email` in this repo).
- Commits must NOT be signed (`git config commit.gpgsign false`, commit with `--no-gpg-sign`): the cloud signing key isn't on the user's GitHub account, so signed commits show "Unverified".
- Commit messages in English.

## Project state
See `docs/journal.md` for decisions made so far and open questions.
