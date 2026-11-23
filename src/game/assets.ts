// Custom game art lives in public so scene URLs stay direct and deployment-safe.
const ART = "/game-art/";

export const SCENES = {
  cover: { l: `${ART}cover.webp`, p: `${ART}cover.webp` },
  meeting: { l: `${ART}boardroom.webp`, p: `${ART}boardroom.webp` },
  brief: { l: `${ART}boardroom.webp`, p: `${ART}boardroom.webp` },
  corridor: { l: `${ART}hr-desk.webp`, p: `${ART}hr-desk.webp` },
  desk: { l: `${ART}hr-desk.webp`, p: `${ART}hr-desk.webp` },
  ceo: { l: `${ART}ceo-office.webp`, p: `${ART}ceo-office.webp` },
} as const;

export type SceneKey = keyof typeof SCENES;

export const PORTRAITS = {
  tarek: `${ART}tarek.webp`,
  sherif: `${ART}sherif.webp`,
  seif: `${ART}sherif.webp`,
  player: `${ART}player.webp`,
} as const;
