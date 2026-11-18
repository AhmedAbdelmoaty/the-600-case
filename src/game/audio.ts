// Tiny Web Audio synth. Created lazily after a user gesture.
let ctx: AudioContext | null = null;
let muted = false;
export const setMuted = (m: boolean) => { muted = m; };

function ac() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, dur: number, type: OscillatorType = "sine", vol = 0.15, delay = 0, slideTo?: number) {
  const c = ac(); if (!c || muted) return;
  const t = c.currentTime + delay;
  const o = c.createOscillator(); const g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.02);
}

function noise(dur: number, vol = 0.12, hp = 1500, delay = 0) {
  const c = ac(); if (!c || muted) return;
  const t = c.currentTime + delay;
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const s = c.createBufferSource(); s.buffer = buf;
  const f = c.createBiquadFilter(); f.type = "highpass"; f.frequency.value = hp;
  const g = c.createGain(); g.gain.value = vol;
  s.connect(f).connect(g).connect(c.destination); s.start(t);
}

export const sfx = {
  tap: () => tone(520, 0.07, "triangle", 0.08),
  paper: () => noise(0.22, 0.1, 2500),
  pen: () => { for (let i = 0; i < 4; i++) noise(0.05, 0.06, 4000, i * 0.07); },
  stamp: () => { tone(90, 0.25, "sine", 0.35, 0, 45); noise(0.1, 0.15, 300); },
  chime: () => { [660, 880, 1320].forEach((f, i) => tone(f, 0.35, "sine", 0.12, i * 0.09)); },
  wobble: () => tone(300, 0.5, "sawtooth", 0.07, 0, 120),
  win: () => { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.4, "triangle", 0.12, i * 0.11)); },
  lose: () => { [392, 330, 262].forEach((f, i) => tone(f, 0.35, "square", 0.06, i * 0.18)); },
};
