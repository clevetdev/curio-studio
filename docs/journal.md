# Journal du projet CURIO

Ce fichier est la mémoire du projet. Toute session (terminal, application de bureau, cloud) doit le lire
pour reprendre le travail, et le mettre à jour quand une décision est prise.

**Dernière mise à jour : 16 octobre 2026.**

## Objectif
Construire une source de revenus durable avec des vidéos courtes de vulgarisation scientifique en motion design
(TikTok, Reels, YouTube Shorts), entièrement générées par Claude : script, voix, musique, animation, sous-titres.
La piste « trading » a été étudiée puis écartée (aucun avantage réel sur le marché, 75-89 % des particuliers perdent).

## Stratégie
- Les vidéos courtes rapportent très peu en direct (Shorts : ~0,02-0,10 € / 1000 vues) : elles servent à attirer du public.
- Revenus visés, par ordre de rapidité : **prestations de motion design** pour entreprises et écoles (500-3000 € la vidéo,
  la chaîne sert de portfolio) → **sponsors** (dès 20-50 k abonnés, 300-2000 € la vidéo) → **vidéos longues YouTube**
  (10 à 50× mieux payées que les Shorts) → produits propres (formation, modèles).
- Niche retenue : **la science appliquée au quotidien** (« pourquoi / comment ça marche »). Moins saturée en français,
  sponsors intéressants, et le sujet tient en 45-90 s.
- Vigilance : depuis 2025, YouTube et TikTok démonétisent le contenu IA « produit en masse ». Miser sur la qualité
  et l'identité plutôt que le volume ; relire chaque script ; envisager d'enregistrer la voix soi-même.

## Décisions prises
- Nom provisoire : **CURIO — la science en 1 minute**. *À vérifier : disponibilité sur TikTok, Instagram, YouTube.*
- Mascotte : **Lumi**, un photon expressif (`Lumi` dans `src/brand.tsx`, humeurs : happy, surprised, confused, wink).
- Identité : fond bleu nuit (#070B24 → #18205A), accent jaune #FFD23F, titres en Fredoka 700, sous-titres en Inter 900.
- Méthode validée par l'utilisateur : **peaufiner un seul épisode au maximum** avant d'en produire d'autres.
- Outils : tout est gratuit et tourne en local (Kokoro / Piper pour la voix, musique et bruitages générés par calcul,
  Remotion pour l'animation). Aucun service payant.

## Épisode 1 : « Pourquoi le ciel n'est pas violet » (v3, 62,2 s)
Script dans `episodes/ciel-violet/script.json`, 12 scènes définies dans `src/scenes.tsx`.

Science vérifiée :
- Diffusion de Rayleigh, intensité ∝ 1/λ⁴ → le bleu (450 nm) est diffusé ≈ 6× plus que le rouge (700 nm), le violet ≈ 9×.
- Le ciel n'est pas violet pour deux raisons : le Soleil émet moins de violet, et l'œil y est peu sensible (courbe V(λ)).
- L'argument « absorption en haute altitude », présent en v1, a été **retiré** : son effet est marginal.
- Les deux courbes affichées à l'écran sont de vraies données (spectre solaire simplifié et V(λ)), dans `src/scenes.tsx`.
- Coucher de soleil : la lumière traverse ≈ 40× plus d'air à l'horizon qu'au zénith.
- Mars (ajout v3, amené comme conséquence du principe : « change d'air, et tu changes de ciel ») : la poussière en suspension rend le ciel orangé le jour, et ses fines particules renvoient le bleu
  vers l'avant, d'où des couchers de soleil bleutés autour du Soleil (observés par les rovers de la NASA).

Choix de réalisation :
- L'accroche tombe dans la première seconde.
- **Boucle parfaite (v3)** : le texte finit sur « …souviens-toi que… » et repart sur « Le ciel devrait être violet ».
  La dernière image est identique à la première (nuages recalés, fond étoilé périodique sur la durée totale,
  pas de zoom sur la dernière scène) ; silence final de 0,1 s, fondu musical de 0,3 s, plus de note finale.
- **Durée > 60 s (v3)** : le programme de rémunération de TikTok exige des vidéos de plus d'une minute ; YouTube
  Shorts n'a pas de minimum (maximum 3 min). Ajouts v3, tous au service du sujet : le nom « diffusion de Rayleigh »,
  le détail du mélange (« un peu de violet, beaucoup de bleu, un peu de vert… ») et la scène Mars.
- Intonation : éviter « … » en milieu de phrase. Le script coupe la phrase dessus, et Kokoro prononce le bout
  restant seul (« bleu ! » sonnait faux). Pour Mars, l'utilisateur a choisi « …et ses couchers de soleil sont bleus ! ».
  Une scène « nuages blancs » a été essayée puis **retirée** : l'utilisateur l'a jugée hors sujet, du remplissage.
  Règle : chaque ajout doit servir la question de l'épisode, jamais combler.
- Prononciation : bloc `"say"` du script (ex. `"Rayleigh": "Rélé"`) ; la voix dit la forme parlée, les
  sous-titres gardent l'orthographe. Sans ça, Kokoro lit « Rayleigh » à l'anglaise.
- Chaque animation est déclenchée par un mot prononcé (les `beats` du script).
- Son : voix Kokoro brute, musique générée avec ducking, whoosh aux transitions, pop sur chaque beat. Normalisé à -14 LUFS / -1,5 dBTP.

## EN ATTENTE : retours de l'utilisateur
Claude ne peut pas écouter l'audio. Ces quatre points bloquent la suite du peaufinage :
1. ~~**Voix**~~ **Tranché le 16 octobre 2026 : Kokoro ff_siwis brut**, sans traitement (`"fx": false` dans le bloc
   `tts`). L'utilisateur la trouve encore « assez synthétique ». Piste : sa machine a une **RTX 5070 Ti (16 Go)**,
   ce qui permet de tester des voix neuronales plus naturelles. Candidat principal : **Chatterbox Multilingual**
   (Resemble AI, licence MIT donc usage commercial permis, gère le français, clonage de voix). À éviter pour une
   chaîne monétisée : XTTS-v2 et Fish Speech, dont les licences interdisent l'usage commercial. Leurs modèles sont
   sur Hugging Face, ce qui est accessible en local mais bloqué en session cloud.
   Extraits d'origine (Kokoro ff_siwis brut, Kokoro traité, Piper siwis, Piper tom, Piper upmc 0 et 1) : `out\voix\`.
   **Test Chatterbox : écarté pour l'instant (16 octobre 2026).** Verdict de l'utilisateur : les versions 2 et 3
   ont un accent bizarre, très nasal (la voix de référence par défaut de Chatterbox n'est pas francophone), et la 4
   n'est qu'une moins bonne copie de la 1. **On garde Kokoro ff_siwis brut.** Si on y revient, il faudra donner à
   Chatterbox un vrai enregistrement de référence en français (sa propre voix, ou un clip sous licence libre).
   Détail du test : `out\comparaison\` contient la même phrase,
   au même volume, en 4 versions (1 Kokoro, 2 Chatterbox par défaut, 3 Chatterbox plus expressif, 4 Chatterbox
   avec le timbre de Kokoro cloné). Installation : venv isolé `.venvs\chatterbox` (ignoré par git), avec
   PyTorch 2.11 cu128, car la RTX 5070 Ti (Blackwell, sm_120) n'est pas gérée par le `torch==2.6.0` qu'impose
   chatterbox-tts 0.1.7. Il faut donc installer `pip install chatterbox-tts --no-deps`, puis ses dépendances à la
   main, et écrire les WAV avec soundfile (torchaudio 2.11 réclame torchcodec). Environ 2,5 à 6 s par phrase. La v2 utilise **Kokoro ff_siwis traité**. Lequel garder ?
   Pour les régénérer : voir « Régénérer le casting voix » plus bas.
2. ~~**Rythme**~~ : jugé « pas mal » par l'utilisateur (v2). À réécouter sur la v3 (nouvelles scènes + boucle).
3. **Musique et bruitages** : volume et style.
4. **Scènes** : laquelle retravailler en priorité ?

## Prochaines étapes, une fois les retours obtenus
1. Appliquer les retours sur l'épisode 1 → version finale.
2. Vérifier la disponibilité du nom CURIO sur les trois plateformes, puis créer les comptes.
3. Préparer une série de 10 épisodes (le pipeline est prêt : un `script.json` par épisode).
4. En parallèle, monter l'offre freelance (grille tarifaire, messages de démarchage) en utilisant la chaîne comme portfolio.

## Poste de travail local (Windows)
La session a été rapatriée du cloud sur `E:\Dev\curio-studio` le 16 octobre 2026.

Déjà présent : Node 24, npm 11, Python 3.13 (`python`, pas `python3`), winget.
**Installation faite le 16 octobre 2026** : ffmpeg 9.0.2 (winget), dépendances npm/pip, modèles de voix.
Les 6 extraits de voix sont dans `out\voix\` et la vidéo v2 dans `out\ciel-violet.mp4` (51,6 s).

Piège Windows : Python lit les fichiers en cp1252 par défaut. Toute lecture ou écriture de texte doit préciser
`encoding="utf-8"`, sinon Kokoro reçoit « lumiÃ¨re » et la vidéo passe de 52 s à 78 s (bug corrigé dans
`build_audio.py`). Les `.ps1` sont enregistrés en UTF-8 **avec BOM**, sinon PowerShell 5.1 affiche mal les accents.
Après l'installation de ffmpeg, un terminal déjà ouvert ne le voit pas : rouvrir le terminal, ou recharger le PATH.

Installation, une seule fois, dans PowerShell :
```powershell
.\scripts\setup.ps1      # installe ffmpeg via winget, puis npm, pip et les modèles (~390 Mo)
```
Si ffmpeg vient d'être installé, fermer et rouvrir le terminal avant de relancer le script.

Fabriquer un épisode (environ 2 minutes) :
```powershell
.\make.ps1 episodes\ciel-violet      # → out\ciel-violet.mp4
```
Sous Linux, macOS ou WSL, les équivalents sont `./scripts/setup.sh` et `./make.sh episodes/ciel-violet`.

**Important :** les rendus de la session cloud (la vidéo v2 et les 6 extraits de voix) n'ont pas été transférés,
car `out/` et `models/` ne sont pas versionnés. La vidéo se régénère avec la commande ci-dessus ; les fichiers
d'origine restent téléchargeables depuis la session cloud sur claude.ai/code.

### Régénérer le casting voix
```powershell
python - <<'PY'
import soundfile as sf, numpy as np, glob, os
from kokoro_onnx import Kokoro
import sherpa_onnx
T = "Normalement, le ciel devrait etre violet. Alors pourquoi on le voit bleu ?"
os.makedirs("out/voix", exist_ok=True)
k = Kokoro("models/kokoro-v1.0.onnx", "models/voices-v1.0.bin")
s, sr = k.create(T, voice="ff_siwis", speed=1.06, lang="fr-fr")
sf.write("out/voix/kokoro.wav", s, sr)
for d in glob.glob("models/piper/vits-piper-*"):
    name = d.split("fr_FR-")[1]
    onnx = glob.glob(d + "/*.onnx")[0]
    tts = sherpa_onnx.OfflineTts(sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(
        vits=sherpa_onnx.OfflineTtsVitsModelConfig(model=onnx, tokens=d + "/tokens.txt",
        data_dir=d + "/espeak-ng-data"), num_threads=4)))
    for sid in range(tts.num_speakers):
        a = tts.generate(T, sid=sid, speed=1.05)
        sf.write(f"out/voix/piper_{name}_{sid}.wav", np.array(a.samples), a.sample_rate)
PY
```
Pour changer la voix de l'épisode, modifier le bloc `tts` dans `episodes/<slug>/script.json` :
`{"engine": "kokoro", "voice": "ff_siwis"}` ou `{"engine": "piper", "voice": "fr_FR-tom-medium", "sid": 0}`.

## Historique des sessions
- **16 octobre 2026, session cloud** (`session_01T4SdFrfiVPrRMRGNCbEohu`) : stratégie, abandon du trading,
  construction du pipeline, épisode 1 en v1 puis v2, dépôt GitHub `clevetdev/curio-studio`.
- **16 octobre 2026, terminal local** : rapatriement via `claude --teleport`, scripts Windows, ce journal.
- **16 octobre 2026, application de bureau (local)** : installation complète sur Windows, correction du bug
  d'encodage, régénération du casting voix et de la v2, envoyés à l'utilisateur pour les 4 retours en attente.
  L'utilisateur préfère être tutoyé, avec un ton détendu.
