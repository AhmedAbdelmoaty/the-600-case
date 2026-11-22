let muted = false;
export const setMuted = (m: boolean) => { muted = m; };

const AUDIO = "/game-audio/";
function play(file: string, volume = 0.5) {
  if (muted || typeof Audio === "undefined") return;
  const sound = new Audio(`${AUDIO}${file}`);
  sound.volume = volume;
  void sound.play().catch(() => undefined);
}

export const sfx = {
  tap: () => play("click.mp3", 0.34),
  paper: () => play("page-turn.mp3", 0.48),
  door: () => play("door-open.mp3", 0.48),
  pen: () => play("pop.mp3", 0.34),
  stamp: () => play("confirmation_002.ogg", 0.6),
  chime: () => play("confirmation_001.ogg", 0.45),
  wobble: () => play("error_002.ogg", 0.38),
  win: () => play("win.mp3", 0.62),
  lose: () => play("lose.mp3", 0.58),
};
export const whoosh = () => play("woosh.mp3", 0.42);
let ctx: AudioContext | null = null;
export function tick(urgent = false) {
  if (muted || typeof window === "undefined") return;
  try {
    ctx ??= new AudioContext();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.value = urgent ? 1100 : 820;
    g.gain.setValueAtTime(0.12, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    o.connect(g).connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime + 0.09);
  } catch { /* ignore */ }
}
