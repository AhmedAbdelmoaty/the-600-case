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
