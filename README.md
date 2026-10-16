# Studio CURIO — la science en 1 minute

Pipeline 100 % génératif pour Shorts / Reels / TikTok (1080×1920).

```
episodes/<slug>/script.json   ← texte par scène + mots-clés (« beats ») qui déclenchent les animations
build_audio.py                ← voix (Kokoro / Piper) + traitement + musique générée + bruitages + timeline
src/                          ← animations Remotion (brand.tsx = identité + mascotte Lumi, scenes.tsx = scènes)
./make.sh episodes/<slug>     ← tout en une commande → out/<slug>.mp4
```

## Installation
```
./scripts/setup.sh                    # dépendances + modèles de voix (une seule fois)
./make.sh episodes/ciel-violet        # → out/ciel-violet.mp4
```
