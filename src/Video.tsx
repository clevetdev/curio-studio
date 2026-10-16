import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import timeline from "../public/timeline.json";
import { BODY, C, SceneCtx, clamp } from "./brand";
import { SCENES } from "./scenes";

// ---------- Fond : dégradé nuit + étoiles + halos lents

const Background: React.FC = () => {
  const f = useCurrentFrame();
  const { durationInFrames: D } = useVideoConfig();
  // Mouvements périodiques sur la durée totale : la dernière image enchaîne sur la première (boucle).
  // a(k) ≈ f / k, arrondi pour faire un nombre entier de tours ; drift(v) ≈ f × v, arrondi à un nombre entier d'écrans.
  const a = (k: number) => (2 * Math.PI * Math.max(1, Math.round(D / (2 * Math.PI * k))) * f) / D;
  const drift = (v: number) => (Math.max(1, Math.round((v * D) / 1920)) * 1920 * f) / D;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 30%, ${C.bg2}, ${C.bg1} 70%)` }}>
      <div style={{ position: "absolute", left: 200 + 120 * Math.sin(a(90)), top: 300 + 80 * Math.cos(a(110)), width: 700, height: 700,
        borderRadius: "50%", background: `radial-gradient(circle, ${C.violet}22, transparent 70%)` }} />
      <div style={{ position: "absolute", left: 300 + 100 * Math.cos(a(100)), top: 1000 + 90 * Math.sin(a(80)), width: 800, height: 800,
        borderRadius: "50%", background: `radial-gradient(circle, ${C.blue}1E, transparent 70%)` }} />
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        {Array.from({ length: 70 }, (_, i) => (
          <circle key={i} cx={(i * 397) % 1080} cy={(i * 661 + drift(0.25 + (i % 3) * 0.2)) % 1920} r={1.2 + (i % 3)}
            fill="white" opacity={0.25 + 0.35 * Math.abs(Math.sin(a(20) + i))} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

// ---------- Sous-titres mot à mot

const WORD_COLORS: [RegExp, string][] = [
  [/violet/i, C.violet], [/bleu/i, C.sky], [/rouge/i, C.red], [/orange/i, C.orange],
  [/soleil/i, C.yellow], [/blanc/i, "#FFFFFF"], [/mille|six/i, C.green],
];

const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const cur = timeline.captions.find((c) => t >= c.start - 0.03 && t < c.end);
  if (!cur) return null;
  const p = spring({ frame: f - Math.round(cur.start * fps), fps, config: { damping: 14, stiffness: 240 } });
  return (
    <div style={{ position: "absolute", top: 1300, width: "100%", textAlign: "center", padding: "0 80px", boxSizing: "border-box" }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: 30, rowGap: 0, transform: `scale(${0.8 + 0.2 * p})`, opacity: Math.min(1, p * 2) }}>
        {cur.words.map((w, i) => {
          const active = t >= w.start - 0.03 && t < w.end + 0.05;
          const hit = WORD_COLORS.find(([re]) => re.test(w.w));
          const color = hit ? hit[1] : active ? C.lumi : "white";
          return (
            <span key={i} style={{
              fontFamily: BODY, fontWeight: 900, fontSize: 84, lineHeight: 1.15, textTransform: "uppercase", color,
              WebkitTextStroke: "12px #05071A", paintOrder: "stroke fill", display: "inline-block",
              transform: `scale(${active ? 1.08 : 1})`, transition: "none",
            }}>{w.w}</span>
          );
        })}
      </div>
    </div>
  );
};

// ---------- Barre de progression (aide à la rétention)

const Progress: React.FC = () => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return <div style={{ position: "absolute", top: 0, left: 0, height: 10, width: `${(f / durationInFrames) * 100}%`, background: C.lumi,
    boxShadow: `0 0 20px ${C.lumi}` }} />;
};

// ---------- Transition entre scènes : zoom + flou rapide

const SceneWrap: React.FC<{ dur: number; first: boolean; last: boolean; children: React.ReactNode }> = ({ dur, first, last, children }) => {
  const f = useCurrentFrame();
  const inP = first ? 1 : interpolate(f, [0, 9], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
  const outP = last ? 0 : interpolate(f, [dur - 7, dur], [0, 1], clamp);
  const drift = last ? 1 : 1 + 0.03 * (f / dur); // la dernière image doit être identique à la première (boucle)
  const scale = (1 + 0.18 * (1 - inP)) * (1 - 0.12 * outP) * drift;
  const blur = 14 * (1 - inP) + 14 * outP;
  return (
    <AbsoluteFill style={{ opacity: Math.min(inP * 1.4, 1 - outP), transform: `scale(${scale})`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined }}>
      {children}
    </AbsoluteFill>
  );
};

export const Video: React.FC = () => {
  const { fps } = useVideoConfig();
  const n = timeline.scenes.length;
  return (
    <AbsoluteFill>
      <Background />
      {timeline.scenes.map((s, i) => {
        const from = Math.round(s.start * fps) - (i === 0 ? Math.round(s.start * fps) : 0);
        const end = i === n - 1 ? timeline.durationInFrames : Math.round(s.end * fps);
        const dur = end - from;
        const Scene = SCENES[s.visual];
        const beats = s.beats.map((b) => Math.round(b * fps) - from);
        return (
          <Sequence key={i} from={from} durationInFrames={dur}>
            <SceneCtx.Provider value={{ dur, beats }}>
              <SceneWrap dur={dur} first={i === 0} last={i === n - 1}><Scene /></SceneWrap>
            </SceneCtx.Provider>
          </Sequence>
        );
      })}
      <Captions />
      <Progress />
      <Audio src={staticFile("audio.wav")} />
    </AbsoluteFill>
  );
};
