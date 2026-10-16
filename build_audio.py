"""Construit toute la bande-son d'un épisode et la timeline lue par Remotion.

  voix (Kokoro ou Piper) → traitement studio → musique générée + ducking → bruitages → mixage → -14 LUFS

Usage : python3 build_audio.py episodes/<slug>
Sortie : public/audio.wav, public/timeline.json
"""
import json, re, subprocess, sys, unicodedata
from pathlib import Path
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt, resample_poly

SR = 48000
FPS = 30
LEAD = 0.12       # la voix démarre quasi immédiatement : l'accroche doit tomber dans la 1re seconde
SENT_GAP = 0.22   # pause entre deux phrases d'une même scène
SCENE_GAP = 0.30  # pause entre deux scènes
TAIL = 0.6

ep = Path(sys.argv[1])
script = json.loads((ep / "script.json").read_text())
cfg = script["tts"]
rng = np.random.default_rng(7)

# ---------------------------------------------------------------- TTS

from kokoro_onnx import Kokoro
_kokoro = Kokoro("models/kokoro-v1.0.onnx", "models/voices-v1.0.bin")
_piper = None


def synth(text):
    global _piper
    if cfg["engine"] == "kokoro":
        s, sr = _kokoro.create(text, voice=cfg["voice"], speed=cfg["speed"], lang="fr-fr")
    else:  # piper via sherpa-onnx, cfg["voice"] = ex. "fr_FR-tom-medium"
        import sherpa_onnx
        if _piper is None:
            d = f"models/piper/vits-piper-{cfg['voice']}"
            _piper = sherpa_onnx.OfflineTts(sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(
                vits=sherpa_onnx.OfflineTtsVitsModelConfig(model=f"{d}/{cfg['voice']}.onnx", tokens=f"{d}/tokens.txt",
                                                            data_dir=f"{d}/espeak-ng-data"), num_threads=4)))
        a = _piper.generate(text, sid=cfg.get("sid", 0), speed=cfg["speed"])
        s, sr = np.array(a.samples), a.sample_rate
    g = np.gcd(SR, sr)
    return resample_poly(np.asarray(s, dtype=np.float64), SR // g, sr // g)


def phon_len(word):
    p = _kokoro.tokenizer.phonemize(word, "fr-fr")
    return max(1, len(re.sub(r"[ˈˌː\s.,?!:;]", "", p)))


def frame_rms(x, win=0.01):
    n = int(win * SR)
    m = len(x) // n
    return np.sqrt((x[: m * n].reshape(m, n) ** 2).mean(1) + 1e-12), n


def trim(x, thr_db=-42):
    r, n = frame_rms(x)
    on = np.where(20 * np.log10(r) > thr_db)[0]
    if len(on) == 0:
        return x
    a, b = max(0, on[0] * n - int(0.01 * SR)), min(len(x), (on[-1] + 1) * n + int(0.04 * SR))
    return x[a:b]


def pauses(x, thr_db=-38, min_len=0.07):
    """Intervalles de silence internes (en s), utilisés pour caler les virgules."""
    r, n = frame_rms(x)
    quiet = 20 * np.log10(r) < thr_db
    out, i = [], 0
    while i < len(quiet):
        if quiet[i]:
            j = i
            while j < len(quiet) and quiet[j]:
                j += 1
            if (j - i) * n / SR >= min_len and i > 0 and j < len(quiet):
                out.append((i * n / SR, j * n / SR))
            i = j
        else:
            i += 1
    return out


def word_times(sentence, x):
    """Estime le début/la fin de chaque mot : ancrage sur les pauses réelles, puis prorata des phonèmes."""
    words = sentence.split()
    dur = len(x) / SR
    breaks = [i for i, w in enumerate(words[:-1]) if re.search(r"[,;:—]$", w)]
    ps = pauses(x)
    if len(ps) > len(breaks):
        ps = sorted(sorted(ps, key=lambda p: p[0] - p[1])[: len(breaks)])
    segs = []  # (index premier mot, index dernier mot exclu, t0, t1)
    if breaks and len(ps) == len(breaks):
        bounds = [0] + [b + 1 for b in breaks] + [len(words)]
        edges = [(None, 0.0)] + list(ps) + [(dur, None)]
        for k in range(len(bounds) - 1):
            segs.append((bounds[k], bounds[k + 1], edges[k][1], edges[k + 1][0]))
    else:
        segs.append((0, len(words), 0.0, dur))
    out = []
    for a, b, t0, t1 in segs:
        wts = [phon_len(w) for w in words[a:b]]
        tot, t = sum(wts), t0
        for w, wt in zip(words[a:b], wts):
            d = (t1 - t0) * wt / tot
            out.append({"w": w, "start": t, "end": t + d})
            t += d
    return out


# ---------------------------------------------------------------- Voix

def norm(w):
    w = unicodedata.normalize("NFC", w.lower())
    return re.sub(r"[^\w'’]", "", w)


voice_parts, scenes, words = [np.zeros(int(LEAD * SR))], [], []
t = LEAD
for si, s in enumerate(script["scenes"]):
    start = t
    sentences = [x for x in re.split(r"(?<=[.?!…])\s+", s["text"].strip()) if x]
    scene_words = []
    for k, sent in enumerate(sentences):
        x = trim(synth(sent))
        for wt in word_times(sent, x):
            scene_words.append({"w": wt["w"], "start": round(t + wt["start"], 3), "end": round(t + wt["end"], 3), "scene": si})
        gap = SENT_GAP if k < len(sentences) - 1 else SCENE_GAP
        voice_parts += [x, np.zeros(int(gap * SR))]
        t += len(x) / SR + gap
    beats = []
    for b in s.get("beats", []):
        name, _, occ = b.partition("#")
        hits = [w for w in scene_words if norm(name) in (norm(w["w"]), re.split(r"['’]", norm(w["w"]))[-1])]
        hit = hits[int(occ or 1) - 1] if len(hits) >= int(occ or 1) else None
        if hit is None:
            sys.exit(f"Beat « {b} » introuvable dans la scène {si} ({s['visual']})")
        beats.append(hit["start"])
    scenes.append({"visual": s["visual"], "text": s["text"], "start": round(start, 3), "end": round(t, 3), "beats": beats})
    words += scene_words
voice_parts.append(np.zeros(int(TAIL * SR)))
voice = np.concatenate(voice_parts)
total = len(voice) / SR
N = len(voice)

# traitement « studio » : EQ, compression, légère réverbération
Path("build").mkdir(exist_ok=True)
sf.write("build/voice_raw.wav", voice, SR)
FX = ("highpass=f=75,equalizer=f=250:t=q:w=1:g=-2,equalizer=f=3500:t=q:w=1.2:g=3,equalizer=f=9500:t=q:w=1:g=2,"
      "acompressor=threshold=-20dB:ratio=3:attack=5:release=80:makeup=2,aecho=0.8:0.4:35|60:0.06|0.035")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "build/voice_raw.wav", "-af", FX, "-ar", str(SR), "build/voice_fx.wav"], check=True)
voice, _ = sf.read("build/voice_fx.wav")
voice = np.pad(voice, (0, max(0, N - len(voice))))[:N]
voice /= np.abs(voice).max()

# ---------------------------------------------------------------- Musique (générée, libre de droits)

tt = np.arange(N) / SR
BPM = 96
BEAT = 60 / BPM
BAR = 4 * BEAT
# Fmaj7 – Am7 – Cmaj7 – G6, voicings ouverts
CHORDS = [[87.31, 174.61, 220.00, 261.63, 329.63], [110.00, 164.81, 196.00, 261.63, 329.63],
          [65.41, 196.00, 246.94, 329.63, 392.00], [98.00, 146.83, 196.00, 246.94, 329.63]]


def lp(x, fc, order=2):
    return sosfilt(butter(order, fc, "low", fs=SR, output="sos"), x)


def hp(x, fc, order=2):
    return sosfilt(butter(order, fc, "high", fs=SR, output="sos"), x)


def saw(f, ph, harmonics=10):
    return sum(np.sin(2 * np.pi * f * k * ph) / k for k in range(1, harmonics + 1))


pad, bass, arp, hats, kick = (np.zeros(N) for _ in range(5))
n_bars = int(np.ceil(total / BAR)) + 1
for bi in range(n_bars):
    ch = CHORDS[bi % 4]
    a = int(bi * BAR * SR)
    b = min(N, int((bi + 1) * BAR * SR + 0.6 * SR))
    if a >= N:
        break
    seg = tt[a:b] - bi * BAR
    env = np.clip(seg / 0.4, 0, 1) * np.clip((BAR + 0.6 - seg) / 0.6, 0, 1)
    for f in ch[1:]:
        pad[a:b] += env * (saw(f * 1.003, seg, 6) + saw(f * 0.997, seg, 6)) * 0.5
    for q in range(4):  # basse : noires
        qa = a + int(q * BEAT * SR)
        qs = tt[qa:min(N, qa + int(BEAT * SR))] - (bi * BAR + q * BEAT)
        bass[qa:qa + len(qs)] += np.exp(-qs * 3) * np.sin(2 * np.pi * ch[0] * qs)
        # kick doux sur 1 et 3
        if q in (0, 2):
            ks = qs[: int(0.25 * SR)]
            kick[qa:qa + len(ks)] += np.exp(-ks * 18) * np.sin(2 * np.pi * (45 + 80 * np.exp(-ks * 40)) * ks)
    for e in range(8):  # arpège en croches
        ea = a + int(e * BEAT / 2 * SR)
        es = tt[ea:min(N, ea + int(0.6 * SR))] - (bi * BAR + e * BEAT / 2)
        f = ch[1:][[0, 2, 1, 3, 2, 3, 1, 2][e]] * 2
        arp[ea:ea + len(es)] += np.exp(-es * 9) * (np.sin(2 * np.pi * f * es) + 0.25 * np.sin(4 * np.pi * f * es))
        ha = ea + int(BEAT / 4 * SR)
        hs = min(N, ha + int(0.04 * SR)) - ha
        if hs > 0:
            hats[ha:ha + hs] += np.exp(-np.arange(hs) / SR * 90) * rng.standard_normal(hs)

pad = lp(pad, 1400)
hats = hp(hats, 7000)
arp = arp + 0.35 * np.pad(arp, (int(BEAT * 0.75 * SR), 0))[:N]  # écho synchronisé
music = (0.35 * pad / np.abs(pad).max() + 0.5 * bass / np.abs(bass).max() + 0.32 * arp / np.abs(arp).max()
         + 0.10 * hats / max(1e-9, np.abs(hats).max()) + 0.45 * kick / np.abs(kick).max())
music *= np.clip(tt / 0.15, 0, 1) * np.clip((total - tt) / 1.2, 0, 1)

# ducking : la musique baisse quand la voix parle
r, n = frame_rms(voice, 0.02)
env = np.repeat(np.convolve(r, np.ones(8) / 8, "same"), n)
env = np.pad(env, (0, N - len(env)), mode="edge")[:N] / r.max()
duck = 1 - 0.55 * np.clip(env * 4, 0, 1)
music = music / np.abs(music).max() * duck

# ---------------------------------------------------------------- Bruitages


def whoosh(d=0.5):
    n = int(d * SR)
    x = rng.standard_normal(n)
    fc = 300 * (12 ** (np.arange(n) / n))  # balayage 300 Hz → 3,6 kHz
    y, s = np.zeros(n), 0.0
    for i in range(n):  # passe-bas à coupure variable (un pôle)
        a = 1 - np.exp(-2 * np.pi * fc[i] / SR)
        s += a * (x[i] - s)
        y[i] = s
    y = hp(y, 200)
    e = np.sin(np.pi * np.linspace(0, 1, n) ** 0.7) ** 2
    return y * e / np.abs(y).max()


def pop():
    n = int(0.12 * SR)
    s = np.arange(n) / SR
    f = 320 + 700 * np.exp(-s * 45)
    return np.exp(-s * 35) * np.sin(2 * np.pi * np.cumsum(f) / SR)


def ding(f=1318.5):
    n = int(1.2 * SR)
    s = np.arange(n) / SR
    return sum(a * np.exp(-s * d) * np.sin(2 * np.pi * f * m * s) for m, a, d in [(1, 1, 4), (2.76, 0.4, 7), (5.4, 0.2, 11)])


sfx = np.zeros(N)


def place(sound, at, gain):
    a = int(at * SR)
    if a < 0:
        sound, a = sound[-a:], 0
    b = min(N, a + len(sound))
    sfx[a:b] += gain * sound[: b - a]


W = whoosh()
for i, sc in enumerate(scenes):
    if i:
        place(W, sc["start"] - 0.3, 0.22)
    for k, bt in enumerate(sc["beats"]):
        place(pop(), bt, 0.16)
place(ding(), scenes[-1]["beats"][-1], 0.12)

# ---------------------------------------------------------------- Mixage

mix = voice + 0.16 * music + sfx
mix /= np.abs(mix).max() / 0.95
sf.write("build/mix.wav", np.stack([mix, mix], 1), SR)
Path("public").mkdir(exist_ok=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "build/mix.wav", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11",
                "-ar", str(SR), "public/audio.wav"], check=True)


# ---------------------------------------------------------------- Sous-titres : groupes de 1 à 3 mots

captions, cur = [], []
for w in words:
    cur.append(w)
    end_clause = re.search(r"[.,:;?!…]$", w["w"])
    if len(cur) >= 3 or end_clause or (cur and w is words[-1]) or words[words.index(w) + 1]["scene"] != w["scene"]:
        captions.append({"start": cur[0]["start"], "end": cur[-1]["end"], "words": cur})
        cur = []
for a, b in zip(captions, captions[1:]):  # pas de trou court entre deux groupes
    if b["start"] - a["end"] < 0.35:
        a["end"] = b["start"]

Path("public/timeline.json").write_text(json.dumps({
    "title": script["title"], "fps": FPS, "durationInFrames": int(np.ceil(total * FPS)),
    "scenes": scenes, "captions": captions}, ensure_ascii=False, indent=1))
print(f"{total:.1f}s · {len(scenes)} scènes · {len(words)} mots · {len(captions)} sous-titres")
