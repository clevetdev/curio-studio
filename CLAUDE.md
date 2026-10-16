# CURIO studio

Fully generated vertical science shorts (1080×1920, ~50 s, French). Brand: "CURIO — la science en 1 minute", mascot Lumi (a photon).

**Read `docs/journal.md` first**: it holds the strategy, the decisions already made, the state of episode 1 and the questions currently waiting on the user. Update it whenever a decision is made.

- Build an episode: Windows → `.\scripts\setup.ps1` once, then `.\make.ps1 episodes\<slug>`. Linux/macOS/WSL → `./scripts/setup.sh`, then `./make.sh episodes/<slug>`. Takes ~2 min, writes `out/<slug>.mp4`.
- The user works on Windows (`E:\Dev\curio-studio`), PowerShell by default, `python` (not `python3`). `out/`, `models/`, `build/` and the generated `public/*` are git-ignored, so renders never survive a machine change — rebuild them.
- `episodes/<slug>/script.json`: one entry per scene → `visual` (key in `SCENES`, src/scenes.tsx), `text` (voice-over), `beats` (spoken words that trigger animations and pop SFX; `word#2` = 2nd occurrence).
- `build_audio.py`: TTS (Kokoro or Piper via sherpa-onnx), voice FX, procedural music with ducking, SFX, -14 LUFS, writes `public/audio.wav` + `public/timeline.json` (word-level timings).
- Remotion: `src/brand.tsx` (palette, fonts, Lumi, helpers `useBeat/useBeatPop/useRamp`), `src/scenes.tsx`, `src/Video.tsx` (captions, transitions, progress bar).
- TTS models come from GitHub releases, never Hugging Face (blocked in cloud sessions).
- Review your own renders by extracting frames with ffmpeg. You cannot hear audio: every voice, music or SFX choice has to be confirmed by the user, who can now play the files locally.
- Scripts must be fact-checked; content is in French.

## Git
- Commit identity: `clevetdev <corentin.levet@epitech.eu>` (set it with `git config user.name/user.email` in this repo).
- Commits must NOT be signed (`git config commit.gpgsign false`, commit with `--no-gpg-sign`): the cloud signing key isn't on the user's GitHub account, so signed commits show "Unverified".
- Commit messages in English.

## Project state
See `docs/journal.md` — strategy, decisions, episode 1, open questions, local setup, session history.
