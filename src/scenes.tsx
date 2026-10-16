import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import {
  Bar, C, DISPLAY, Label, Lumi, Molecule, RAINBOW, Title, Wave, clamp, useBeat, useBeatPop, usePop, useRamp, useScene,
} from "./brand";

const mixCol = (a: string, b: string, t: number) => `color-mix(in oklab, ${a} ${(1 - t) * 100}%, ${b})`;

// ---------------------------------------------------------------- Fenêtre de ciel (accroche + boucle)

const SkyWindow: React.FC<{ toBlue: number; word: string; wordP: number; strike?: number; mood: "happy" | "confused" | "wink"; lumiP: number }> =
  ({ toBlue, word, wordP, strike = 0, mood, lumiP }) => {
    const f = useCurrentFrame();
    const top = mixCol("#7B2FF7", "#1E7BFF", toBlue);
    const bot = mixCol("#D58BFF", "#9ADFFF", toBlue);
    return (
      <>
        <div style={{
          position: "absolute", left: 90, top: 380, width: 900, height: 860, borderRadius: 60, overflow: "hidden",
          background: `linear-gradient(180deg, ${top}, ${bot})`, boxShadow: `0 30px 120px ${mixCol(C.violet, C.blue, toBlue)}88`,
          border: "6px solid rgba(255,255,255,0.25)",
        }}>
          {/* nuages */}
          {[[120, 160, 1], [560, 90, 0.8], [420, 320, 0.6]].map(([x, y, s], i) => (
            <div key={i} style={{ position: "absolute", left: x + ((f * (0.6 + i * 0.3)) % 1100) - 200, top: y, width: 220 * s, height: 70 * s, borderRadius: 50, background: "rgba(255,255,255,0.35)" }} />
          ))}
          {/* collines */}
          <svg width={900} height={860} style={{ position: "absolute" }}>
            <path d="M0 700 Q 220 600 450 690 T 900 660 L 900 860 L 0 860 Z" fill="#0E1440" />
            <path d="M0 760 Q 300 690 600 760 T 900 740 L 900 860 L 0 860 Z" fill="#070B24" />
          </svg>
          <div style={{
            position: "absolute", top: 300, width: "100%", textAlign: "center", fontFamily: DISPLAY, fontWeight: 700,
            fontSize: 190, color: "white", transform: `scale(${wordP})`, textShadow: "0 10px 40px rgba(0,0,0,0.35)",
          }}>
            <span style={{ position: "relative" }}>
              {word}
              <span style={{ position: "absolute", left: -10, top: "52%", height: 18, width: `${strike * 104}%`, background: C.red, borderRadius: 9 }} />
            </span>
          </div>
        </div>
        {lumiP > 0.01 && <Lumi x={540} y={1150} size={150} mood={mood} scale={lumiP} look={Math.sin(f / 20)} />}
      </>
    );
  };

export const Hook: React.FC = () => {
  const wordP = useBeatPop(0, -2, 9);
  const blue = useRamp(useBeat(1, -4), useBeat(1, 6));
  const strike = useRamp(useBeat(1, -2), useBeat(1, 8));
  const lumiP = useBeatPop(1, 4, 10);
  return (
    <AbsoluteFill>
      <Title y={150} size={100} at={-30}>LE CIEL<br />DEVRAIT ÊTRE…</Title>
      <SkyWindow toBlue={blue} word="VIOLET" wordP={wordP} strike={strike} mood="confused" lumiP={lumiP} />
    </AbsoluteFill>
  );
};

export const Loop: React.FC = () => {
  const { dur } = useScene();
  const blueP = useBeatPop(0, -2);
  const toViolet = useRamp(useBeat(1, -4), useBeat(1, 6));
  const wordP = useBeatPop(1, -2, 9);
  const titleP = useRamp(dur - 20, dur - 8);
  return (
    <AbsoluteFill>
      <div style={{ opacity: 1 - titleP }}>
        <Title y={150} size={100} at={0}>LA PROCHAINE<br />FOIS…</Title>
      </div>
      <div style={{ opacity: titleP }}>
        <Title y={150} size={100} at={-30}>LE CIEL<br />DEVRAIT ÊTRE…</Title>
      </div>
      <SkyWindow toBlue={blueP * (1 - toViolet)} word={toViolet > 0.5 ? "VIOLET" : "BLEU ?"} wordP={toViolet > 0.5 ? wordP : blueP * (1 - toViolet * 2)}
        mood="wink" lumiP={1 - titleP} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- Le rayon de soleil

const Sun: React.FC<{ x: number; y: number; r?: number; color?: string }> = ({ x, y, r = 130, color = C.yellow }) => {
  const f = useCurrentFrame();
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", overflow: "visible" }}>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2 + f / 90;
        return <line key={i} x1={x + Math.cos(a) * r * 1.2} y1={y + Math.sin(a) * r * 1.2} x2={x + Math.cos(a) * r * 1.55}
          y2={y + Math.sin(a) * r * 1.55} stroke={color} strokeWidth={14} strokeLinecap="round" opacity={0.8} />;
      })}
      <circle cx={x} cy={y} r={r} fill={color} style={{ filter: `drop-shadow(0 0 70px ${color})` }} />
    </svg>
  );
};

export const Intro: React.FC = () => {
  const sunP = usePop(0, 14);
  const fly = useRamp(useBeat(0, -6), useBeat(0, 16));
  const lx = interpolate(fly, [0, 1], [230, 600]);
  const ly = interpolate(fly, [0, 1], [500, 900]);
  return (
    <AbsoluteFill>
      <div style={{ transform: `scale(${sunP})`, transformOrigin: "230px 500px", position: "absolute", inset: 0 }}>
        <Sun x={230} y={500} r={150} />
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <line x1={230} y1={500} x2={lx} y2={ly} stroke={C.lumi} strokeWidth={26} strokeLinecap="round" opacity={0.5 * fly}
          style={{ filter: `drop-shadow(0 0 20px ${C.lumi})` }} />
      </svg>
      {fly > 0 && <Lumi x={lx} y={ly} size={170} mood="happy" scale={0.4 + 0.6 * fly} />}
      <Label x={640} y={1130} at={useBeat(0, 14)} color={C.lumi} size={64}>☝ moi, un photon !</Label>
    </AbsoluteFill>
  );
};

export const Spectrum: React.FC = () => {
  const f = useCurrentFrame();
  const inP = useRamp(0, 14);
  const fan = useRamp(useBeat(1, -4), useBeat(1, 18));
  const lx = interpolate(inP, [0, 1], [80, 330]);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <line x1={0} y1={760} x2={lx + 120 + 120 * fan} y2={760} stroke="white" strokeWidth={26} strokeLinecap="round"
          style={{ filter: "drop-shadow(0 0 22px white)" }} />
        <polygon points="560,560 720,900 400,900" fill="rgba(255,255,255,0.10)" stroke="white" strokeWidth={6} strokeLinejoin="round" />
        {RAINBOW.map((c, i) => {
          const a = (-0.34 + i * 0.105) * fan + 0.12;
          const len = 470 * fan;
          return <line key={c} x1={585} y1={770} x2={585 + Math.cos(a) * len} y2={770 + Math.sin(a) * len}
            stroke={c} strokeWidth={20} strokeLinecap="round" opacity={fan} style={{ filter: `drop-shadow(0 0 10px ${c})` }} />;
        })}
      </svg>
      {fan < 0.3 && <Lumi x={lx} y={760} size={120} mood="happy" color="#FFFBEA" />}
      <Title y={300} size={110} at={useBeat(0, -3)}>BLANCHE ?</Title>
      <Title y={1110} size={68} at={useBeat(1, 6)} color={C.muted}>= TOUTES LES COULEURS</Title>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- Les molécules

const N2 = [[180, 520], [460, 940], [860, 560], [300, 1040], [760, 1000]];
const O2 = [[620, 480], [140, 860], [900, 830]];

export const Molecules: React.FC = () => {
  const zoom = useRamp(useBeat(2, -4), useBeat(2, 14));
  const wIn = useRamp(0, 20);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", inset: 0, opacity: 1 - zoom }}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Wave y={760} color="white" wl={380} amp={80} reveal={wIn} />
          {N2.map(([x, y], i) => <PopMol key={"n" + i} x={x} y={y} color={C.blue} beat={0} i={i} />)}
          {O2.map(([x, y], i) => <PopMol key={"o" + i} x={x} y={y} color={C.red} beat={1} i={i} />)}
        </svg>
        <Label x={300} y={340} at={useBeat(0)} color={C.blue} size={84}>N₂ azote</Label>
        <Label x={780} y={340} at={useBeat(1)} color={C.red} size={84}>O₂ oxygène</Label>
      </div>
      {zoom > 0 && <ScaleCompare p={zoom} />}
    </AbsoluteFill>
  );
};

const PopMol: React.FC<{ x: number; y: number; color: string; beat: number; i: number }> = ({ x, y, color, beat, i }) => {
  const p = useBeatPop(beat, i * 3, 9);
  return <Molecule x={x} y={y} color={color} s={p * 1.2} spin={i * 40} />;
};

const ScaleCompare: React.FC<{ p: number }> = ({ p }) => (
  <AbsoluteFill style={{ opacity: p }}>
    <svg width={1080} height={1920} style={{ position: "absolute" }}>
      <Wave x0={60} x1={1020} y={720} color="white" wl={960} amp={230} speed={8} width={14} />
      <line x1={60} y1={1010} x2={1020} y2={1010} stroke={C.muted} strokeWidth={5} />
      <line x1={60} y1={990} x2={60} y2={1030} stroke={C.muted} strokeWidth={5} />
      <line x1={1020} y1={990} x2={1020} y2={1030} stroke={C.muted} strokeWidth={5} />
      <circle cx={540} cy={720} r={4} fill={C.blue} style={{ filter: `drop-shadow(0 0 8px ${C.blue})` }} />
      <circle cx={540} cy={720} r={36} fill="none" stroke={C.blue} strokeWidth={3} strokeDasharray="8 8" />
    </svg>
    <div style={{ position: "absolute", top: 1050, width: "100%", textAlign: "center", fontFamily: DISPLAY, fontWeight: 600, fontSize: 48, color: C.muted }}>
      une onde lumineuse ≈ 450 nm
    </div>
    <div style={{ position: "absolute", left: 600, top: 760, fontFamily: DISPLAY, fontWeight: 600, fontSize: 44, color: C.blue }}>← molécule ≈ 0,3 nm</div>
    <Title y={240} size={150} at={0} color={C.lumi}>× 1 000+</Title>
  </AbsoluteFill>
);

// ---------------------------------------------------------------- Diffusion

const Spray: React.FC<{ x: number; y: number; color: string; start: number; n?: number; reach?: number }> = ({ x, y, color, start, n = 12, reach = 300 }) => {
  const f = useCurrentFrame();
  if (f < start) return null;
  return (
    <>
      {Array.from({ length: n * 2 }, (_, i) => {
        const a = (i * 2.399) % (Math.PI * 2);
        const k = ((f - start) * 0.03 + (i % n) / n) % 1;
        return <circle key={i} cx={x + Math.cos(a) * reach * k} cy={y + Math.sin(a) * reach * k} r={13 * (1 - k * 0.5)} fill={color} opacity={(1 - k) * 0.95} />;
      })}
    </>
  );
};

export const Scatter: React.FC = () => {
  const bars = useRamp(useBeat(1, -4), useBeat(1, 14));
  const six = useRamp(useBeat(2, -4), useBeat(2, 18));
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <Wave x0={60} x1={1020} y={380} color={C.red} wl={340} amp={45} />
        <Wave x0={60} x1={520} y={620} color={C.blue} wl={130} amp={45} speed={2} />
        <Molecule x={540} y={620} color="#9BB6FF" s={1.1} />
        <Spray x={540} y={620} color={C.blue} start={useBeat(0, -2)} reach={260} />
      </svg>
      <Label x={540} y={290} at={2} color={C.red} size={46}>onde longue : passe tout droit</Label>
      <Label x={290} y={530} at={useBeat(0, -3)} color={C.blue} size={46}>onde courte</Label>
      <Bar x={360} base={1240} h={70} color={C.red} label="×1" grow={bars} />
      <Bar x={720} base={1240} h={70 + 340 * six} color={C.blue} label={six > 0.1 ? "×6" : ""} grow={bars} />
    </AbsoluteFill>
  );
};

export const Fill: React.FC = () => {
  const fill = useRamp(useBeat(0, -6), useBeat(1, 10));
  const beam = useRamp(0, 18);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.blue}${Math.round(fill * 140).toString(16).padStart(2, "0")}, transparent 75%)` }}>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <defs>
          <radialGradient id="atm" cx="50%" cy="100%" r="100%">
            <stop offset="70%" stopColor={C.sky} stopOpacity={0.25 + 0.75 * fill} />
            <stop offset="100%" stopColor={C.sky} stopOpacity={0} />
          </radialGradient>
        </defs>
        <circle cx={540} cy={2050} r={1500} fill="url(#atm)" />
        <circle cx={540} cy={2050} r={980} fill="#0E1A4A" stroke="#2A3A88" strokeWidth={6} />
        <line x1={-40} y1={420} x2={-40 + 1200 * beam} y2={720} stroke="white" strokeWidth={18} strokeLinecap="round" opacity={0.9}
          style={{ filter: "drop-shadow(0 0 16px white)" }} />
        <Spray x={330} y={600} color={C.blue} start={useBeat(0, -12)} reach={360} />
        <Spray x={700} y={690} color={C.blue} start={useBeat(0, -4)} reach={360} />
        {/* observateur */}
        <g transform="translate(540 1070)">
          <circle cy={-70} r={22} fill="white" />
          <line y1={-48} y2={0} stroke="white" strokeWidth={10} strokeLinecap="round" />
          <line x1={-22} y1={20} y2={0} stroke="white" strokeWidth={10} strokeLinecap="round" />
          <line x1={22} y1={20} y2={0} stroke="white" strokeWidth={10} strokeLinecap="round" />
        </g>
      </svg>
      <Title y={170} size={92} at={useBeat(1, -4)} color={C.sky}>LE CIEL ENTIER</Title>
    </AbsoluteFill>
  );
};

export const Violet: React.FC = () => {
  const f = useCurrentFrame();
  const vIn = useRamp(useBeat(0, -4), useBeat(0, 12));
  const vGrow = useRamp(useBeat(1, -4), useBeat(1, 16));
  const q = useBeatPop(2, -4, 8);
  return (
    <AbsoluteFill>
      <Bar x={220} base={1240} h={70} color={C.red} label="×1" grow={1} />
      <Bar x={540} base={1240} h={410} color={C.blue} label="×6" grow={1} />
      <Bar x={860} base={1240} h={410 + 250 * vGrow} color={C.violet} label={vGrow > 0.5 ? "×9" : ""} grow={vIn} />
      <Title y={170} size={100} at={useBeat(0, -3)} color={C.violet}>ET LE VIOLET ?</Title>
      {q > 0.01 && <Lumi x={300} y={520} size={150} mood="confused" scale={q} />}
      <div style={{ position: "absolute", left: 420, top: 330, fontFamily: DISPLAY, fontWeight: 700, fontSize: 220, color: C.violet,
        transform: `scale(${q}) rotate(${12 * Math.sin(f / 5)}deg)`, textShadow: `0 0 50px ${C.violet}` }}>?</div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- Les raisons (avec vraies courbes)

const LAMBDA = [400, 425, 450, 475, 500, 525, 550, 575, 600, 625, 650, 675, 700];
const SUN = [0.55, 0.72, 0.93, 1, 0.98, 0.96, 0.95, 0.93, 0.9, 0.88, 0.85, 0.82, 0.78];       // spectre solaire (simplifié)
const EYE = [0.0004, 0.004, 0.038, 0.11, 0.32, 0.79, 0.99, 0.92, 0.63, 0.32, 0.107, 0.032, 0.004]; // sensibilité de l'œil V(λ)

const Curve: React.FC<{ data: number[]; p: number; w?: number; h?: number }> = ({ data, p, w = 760, h = 220 }) => {
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - v * h}`);
  const id = `spec${data[0]}`;
  return (
    <svg width={w} height={h + 10} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={id} x1="0" x2="1">
          {[C.violet, C.indigo, C.blue, C.cyan, C.green, C.yellow, C.orange, C.red].map((c, i) => <stop key={i} offset={i / 7} stopColor={c} />)}
        </linearGradient>
        <clipPath id={id + "c"}><rect width={w * p} height={h + 10} /></clipPath>
      </defs>
      <g clipPath={`url(#${id}c)`}>
        <polygon points={`0,${h} ${pts.join(" ")} ${w},${h}`} fill={`url(#${id})`} opacity={0.85} />
        <polyline points={pts.join(" ")} fill="none" stroke="white" strokeWidth={5} />
      </g>
      <line x1={0} y1={h} x2={w} y2={h} stroke={C.muted} strokeWidth={3} />
      <text x={0} y={h + 44} fill={C.violet} fontFamily="Fredoka" fontWeight={600} fontSize={34}>violet</text>
      <text x={w} y={h + 44} fill={C.red} fontFamily="Fredoka" fontWeight={600} fontSize={34} textAnchor="end">rouge</text>
    </svg>
  );
};

const ReasonCard: React.FC<{ n: string; title: string; data: number[]; y: number; at: number; icon: React.ReactNode }> =
  ({ n, title, data, y, at, icon }) => {
    const p = usePop(at, 13);
    const draw = useRamp(at + 4, at + 30);
    return (
      <div style={{
        position: "absolute", top: y, left: 70, right: 70, height: 450, borderRadius: 44, padding: "30px 50px", boxSizing: "border-box",
        background: "rgba(255,255,255,0.07)", border: "4px solid rgba(255,255,255,0.18)",
        transform: `translateX(${(1 - p) * -1000}px)`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24, fontFamily: DISPLAY, fontWeight: 700, fontSize: 54, color: C.white, lineHeight: 1.05 }}>
          <div style={{ minWidth: 80, height: 80, borderRadius: 40, background: C.lumi, color: C.ink, display: "flex", alignItems: "center", justifyContent: "center" }}>{n}</div>
          <div style={{ flex: 1 }}>{title}</div>
          {icon}
        </div>
        <div style={{ marginTop: 22, display: "flex", justifyContent: "center" }}><Curve data={data} p={draw} /></div>
      </div>
    );
  };

const SunIcon = () => <svg width={90} height={90}><circle cx={45} cy={45} r={26} fill={C.yellow} />{Array.from({ length: 8 }, (_, i) => { const a = i * Math.PI / 4; return <line key={i} x1={45 + Math.cos(a) * 34} y1={45 + Math.sin(a) * 34} x2={45 + Math.cos(a) * 44} y2={45 + Math.sin(a) * 44} stroke={C.yellow} strokeWidth={6} strokeLinecap="round" />; })}</svg>;
const EyeIcon = () => <svg width={110} height={90}><path d="M5 45 Q55 -5 105 45 Q55 95 5 45 Z" fill="white" /><circle cx={55} cy={45} r={20} fill={C.blue} /><circle cx={55} cy={45} r={9} fill={C.ink} /></svg>;

export const Reasons: React.FC = () => (
  <AbsoluteFill>
    <ReasonCard n="1" title="Le Soleil émet moins de violet" data={SUN} y={250} at={useBeat(0, -4)} icon={<SunIcon />} />
    <ReasonCard n="2" title="Nos yeux le captent mal" data={EYE} y={760} at={useBeat(1, -4)} icon={<EyeIcon />} />
  </AbsoluteFill>
);

// ---------------------------------------------------------------- Le cerveau mélange

export const Brain: React.FC = () => {
  const f = useCurrentFrame();
  const m = useRamp(useBeat(0, -4), useBeat(1, 0));
  const merged = useBeatPop(1, -2, 10);
  const cols = [C.violet, C.indigo, C.blue, C.cyan, C.green];
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        {cols.map((c, i) => {
          const a = (i / cols.length) * Math.PI * 2 + f / 35;
          return <circle key={c} cx={540 + Math.cos(a) * 290 * (1 - m)} cy={760 + Math.sin(a) * 290 * (1 - m)} r={140}
            fill={c} opacity={0.6 * (1 - merged)} style={{ mixBlendMode: "screen" }} />;
        })}
        <circle cx={540} cy={760} r={320 * merged} fill={C.sky} style={{ filter: `drop-shadow(0 0 90px ${C.sky})` }} />
      </svg>
      <Title y={170} size={92} at={useBeat(0, -4)}>TON CERVEAU<br />FAIT LE MÉLANGE</Title>
      <Label x={540} y={760} at={useBeat(1, 4)} color={C.ink} size={96}>BLEU CIEL</Label>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- Coucher de soleil

export const Sunset: React.FC = () => {
  const f = useCurrentFrame();
  const move = useRamp(useBeat(0, -12), useBeat(0, 14));
  const lose = useBeat(1, -4);
  const orange = useRamp(useBeat(2, -10), useBeat(2, 14));
  const ang = interpolate(move, [0, 1], [-Math.PI / 2, -Math.PI + 0.12]);
  const R = 950, cx = 540, cy = 2000;
  const ox = 540, oy = cy - R; // observateur
  const sx = ox + Math.cos(ang) * 450, sy = oy + Math.sin(ang) * 450;
  const sunCol = mixCol(C.yellow, C.orange, orange);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, transparent 40%, ${mixCol("transparent", "#FF6A3D55", orange)} 100%)` }}>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <circle cx={cx} cy={cy} r={R + 260} fill={mixCol("#62C3FF", "#FF7A3D", orange)} opacity={0.35} />
        <circle cx={cx} cy={cy} r={R} fill="#0E1A4A" stroke="#2A3A88" strokeWidth={6} />
        <line x1={sx} y1={sy} x2={ox} y2={oy} stroke={sunCol} strokeWidth={12} strokeDasharray="22 16" strokeDashoffset={-f * 3}
          style={{ filter: `drop-shadow(0 0 10px ${sunCol})` }} />
        <Spray x={(sx + ox * 3) / 4} y={(sy + oy * 3) / 4} color={C.blue} start={lose} reach={200} n={8} />
        <Spray x={(sx + ox) / 2} y={(sy + oy) / 2} color={C.blue} start={lose + 6} reach={200} n={8} />
        <circle cx={ox} cy={oy - 40} r={18} fill="white" />
        <line x1={ox} y1={oy - 22} x2={ox} y2={oy} stroke="white" strokeWidth={9} />
      </svg>
      <div style={{ position: "absolute", left: sx - 100, top: sy - 100 }}>
        <svg width={200} height={200} style={{ overflow: "visible" }}><circle cx={100} cy={100} r={90} fill={sunCol} style={{ filter: `drop-shadow(0 0 60px ${sunCol})` }} /></svg>
      </div>
      <Title y={160} size={86} at={useBeat(0, -4)}>≈ 40× PLUS D'AIR</Title>
      <Title y={1110} size={84} at={useBeat(2, -2)}>
        <span style={{ color: C.orange }}>ORANGE</span> + <span style={{ color: C.red }}>ROUGE</span>
      </Title>
    </AbsoluteFill>
  );
};

export const SCENES: Record<string, React.FC> = {
  hook: Hook, intro: Intro, spectrum: Spectrum, molecules: Molecules, scatter: Scatter, fill: Fill,
  violet: Violet, reasons: Reasons, brain: Brain, sunset: Sunset, loop: Loop,
};
