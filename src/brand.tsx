import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import "@fontsource/inter/900.css";
import "@fontsource/fredoka/600.css";
import "@fontsource/fredoka/700.css";

// Identité « CURIO — la science en 1 minute »
export const C = {
  bg1: "#070B24", bg2: "#18205A", white: "#F5F7FF", muted: "#A9B1E8", ink: "#0A0E2A",
  lumi: "#FFD23F", red: "#FF4D5E", orange: "#FF9F1C", yellow: "#FFE14D", green: "#3EE08F",
  cyan: "#3EE0E0", blue: "#3D9BFF", indigo: "#6262FF", violet: "#B44DFF", sky: "#62C3FF",
};
export const RAINBOW = [C.red, C.orange, C.yellow, C.green, C.blue, C.indigo, C.violet];
export const DISPLAY = "Fredoka, sans-serif";
export const BODY = "Inter, sans-serif";
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ---- Contexte de scène : instants (en frames, relatifs à la scène) des mots-clés
export const SceneCtx = React.createContext<{ dur: number; beats: number[] }>({ dur: 1, beats: [] });
export const useScene = () => React.useContext(SceneCtx);
export const useBeat = (i: number, offset = 0) => {
  const { beats, dur } = useScene();
  return (beats[i] ?? dur * 0.5) + offset;
};

/** Ressort qui démarre au beat i (ou à une frame donnée). */
export const usePop = (at: number, damping = 12, stiffness = 160) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - at, fps, config: { damping, stiffness } });
};
export const useBeatPop = (i: number, offset = 0, damping = 12) => usePop(useBeat(i, offset), damping);

/** Valeur 0→1 entre deux frames, avec easing doux. */
export const useRamp = (a: number, b: number) => {
  const f = useCurrentFrame();
  return interpolate(f, [a, b], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
};

export const Title: React.FC<{ children: React.ReactNode; y?: number; size?: number; at?: number; color?: string }> =
  ({ children, y = 200, size = 96, at = 0, color = C.white }) => {
    const p = usePop(at);
    return (
      <div style={{
        position: "absolute", top: y, width: "100%", textAlign: "center", fontFamily: DISPLAY, fontWeight: 700,
        fontSize: size, color, lineHeight: 1.0, letterSpacing: -1, padding: "0 70px", boxSizing: "border-box",
        transform: `translateY(${(1 - p) * 40}px) scale(${0.6 + 0.4 * p})`, opacity: Math.min(1, p * 1.5),
        textShadow: "0 8px 30px rgba(0,0,0,0.45)",
      }}>{children}</div>
    );
  };

export const Label: React.FC<{ x: number; y: number; children: React.ReactNode; at: number; color?: string; size?: number }> =
  ({ x, y, children, at, color = C.white, size = 48 }) => {
    const p = usePop(at);
    return (
      <div style={{
        position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scale(${p})`, fontFamily: DISPLAY,
        fontWeight: 700, fontSize: size, color, whiteSpace: "nowrap", textShadow: "0 4px 16px rgba(0,0,0,0.6)",
      }}>{children}</div>
    );
  };

// ---- Lumi, la mascotte : un photon curieux
export type Mood = "happy" | "surprised" | "confused" | "wink";
export const Lumi: React.FC<{ x: number; y: number; size?: number; mood?: Mood; color?: string; scale?: number; look?: number }> =
  ({ x, y, size = 160, mood = "happy", color = C.lumi, scale = 1, look = 0 }) => {
    const f = useCurrentFrame();
    const blink = f % 96 > 90 ? 0.15 : 1;
    const bob = Math.sin(f / 9) * 8;
    const r = size / 2;
    const eyeH = (mood === "surprised" ? 0.24 : 0.18) * size * blink;
    const ex = look * r * 0.12;
    return (
      <svg width={size * 2.4} height={size * 2.4} viewBox={`${-size * 1.2} ${-size * 1.2} ${size * 2.4} ${size * 2.4}`}
        style={{ position: "absolute", left: x - size * 1.2, top: y - size * 1.2 + bob, transform: `scale(${scale})`, overflow: "visible" }}>
        <defs>
          <radialGradient id={`lg${size}${color}`} cx="38%" cy="32%" r="70%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor={color} />
            <stop offset="100%" stopColor={color} stopOpacity={0.85} />
          </radialGradient>
          <radialGradient id={`glow${size}${color}`}>
            <stop offset="30%" stopColor={color} stopOpacity={0.55} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </radialGradient>
        </defs>
        <circle r={r * 2.1} fill={`url(#glow${size}${color})`} />
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2 + f / 30;
          const l = r * (1.25 + 0.1 * Math.sin(f / 5 + i));
          return <line key={i} x1={Math.cos(a) * r * 1.08} y1={Math.sin(a) * r * 1.08} x2={Math.cos(a) * l} y2={Math.sin(a) * l}
            stroke={color} strokeWidth={size * 0.05} strokeLinecap="round" />;
        })}
        <circle r={r} fill={`url(#lg${size}${color})`} />
        {mood === "wink"
          ? <path d={`M ${-r * 0.42} ${-r * 0.12} q ${r * 0.14} ${-r * 0.14} ${r * 0.28} 0`} stroke={C.ink} strokeWidth={size * 0.05} fill="none" strokeLinecap="round" />
          : <ellipse cx={-r * 0.28 + ex} cy={-r * 0.12} rx={size * 0.07} ry={eyeH / 2} fill={C.ink} />}
        <ellipse cx={r * 0.28 + ex} cy={-r * 0.12} rx={size * 0.07} ry={eyeH / 2} fill={C.ink} />
        {mood === "confused" && <path d={`M ${r * 0.12} ${-r * 0.5} l ${r * 0.32} ${-r * 0.1}`} stroke={C.ink} strokeWidth={size * 0.04} strokeLinecap="round" />}
        {mood === "surprised"
          ? <ellipse cx={ex} cy={r * 0.35} rx={size * 0.07} ry={size * 0.09} fill={C.ink} />
          : mood === "confused"
            ? <path d={`M ${-r * 0.2} ${r * 0.38} q ${r * 0.1} ${-r * 0.1} ${r * 0.2} 0 t ${r * 0.2} 0`} stroke={C.ink} strokeWidth={size * 0.04} fill="none" strokeLinecap="round" />
            : <path d={`M ${-r * 0.25} ${r * 0.25} q ${r * 0.25} ${r * 0.28} ${r * 0.5} 0`} stroke={C.ink} strokeWidth={size * 0.05} fill="none" strokeLinecap="round" />}
        <ellipse cx={-r * 0.55} cy={r * 0.2} rx={r * 0.12} ry={r * 0.07} fill="#FF8FA3" opacity={0.6} />
        <ellipse cx={r * 0.55} cy={r * 0.2} rx={r * 0.12} ry={r * 0.07} fill="#FF8FA3" opacity={0.6} />
      </svg>
    );
  };

/** Onde sinusoïdale animée. */
export const Wave: React.FC<{ x0?: number; x1?: number; y: number; color: string; wl: number; amp?: number; speed?: number; width?: number; reveal?: number }> =
  ({ x0 = 0, x1 = 1080, y, color, wl, amp = 40, speed = 4, width = 10, reveal = 1 }) => {
    const f = useCurrentFrame();
    const end = x0 + (x1 - x0) * reveal;
    const n = 160;
    const pts = Array.from({ length: n }, (_, i) => {
      const x = x0 + (i / (n - 1)) * (end - x0);
      return `${x.toFixed(1)},${(y + amp * Math.sin(((x - x0) / wl) * 2 * Math.PI - f / speed)).toFixed(1)}`;
    }).join(" ");
    return <polyline points={pts} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round"
      style={{ filter: `drop-shadow(0 0 14px ${color})` }} />;
  };

export const Molecule: React.FC<{ x: number; y: number; color: string; s?: number; spin?: number }> = ({ x, y, color, s = 1, spin = 0 }) => {
  const f = useCurrentFrame();
  return (
    <g transform={`translate(${x + 6 * Math.sin(f / 11 + x)} ${y + 6 * Math.cos(f / 13 + y)}) rotate(${spin + f * 1.5}) scale(${s})`}>
      <circle cx={-15} r={20} fill={color} />
      <circle cx={15} r={20} fill={color} />
      <circle cx={-21} cy={-7} r={6} fill="white" opacity={0.5} />
    </g>
  );
};

export const Bar: React.FC<{ x: number; base: number; h: number; color: string; label: string; grow: number; w?: number }> =
  ({ x, base, h, color, label, grow, w = 160 }) => (
    <div style={{ position: "absolute", left: x - w / 2, top: base - h * grow - 80, width: w, textAlign: "center" }}>
      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 60, color: C.white, opacity: grow, height: 80 }}>{label}</div>
      <div style={{ height: h * grow, background: `linear-gradient(180deg, ${color}, ${color}AA)`, borderRadius: 26, boxShadow: `0 0 40px ${color}88` }} />
    </div>
  );
