import drive from "./assets/sayes/drive.png.asset.json";
import parking from "./assets/sayes/parking.png.asset.json";
import sWhistle from "./assets/sayes/whistle.webp.asset.json";
import sMoney from "./assets/sayes/money.webp.asset.json";
import sDisgusted from "./assets/sayes/disgusted.webp.asset.json";
import sSmart from "./assets/sayes/smart.webp.asset.json";
import sSmug from "./assets/sayes/smug.webp.asset.json";
import sPortrait from "./assets/sayes/portrait.webp.asset.json";
// Custom game art lives in public so scene URLs stay direct and deployment-safe.
const ART = "/game-art/";

export const SCENES = {
  cover: { l: `${ART}cover.webp`, p: `${ART}cover.webp` },
  meeting: { l: `${ART}boardroom.webp`, p: `${ART}boardroom.webp` },
  brief: { l: `${ART}boardroom.webp`, p: `${ART}boardroom.webp` },
  corridor: { l: `${ART}hr-desk.webp`, p: `${ART}hr-desk.webp` },
  desk: { l: `${ART}hr-desk.webp`, p: `${ART}hr-desk.webp` },
  ceo: { l: `${ART}ceo-office.webp`, p: `${ART}ceo-office.webp` },
  drive: { l: drive.url, p: drive.url },
  parking: { l: parking.url, p: parking.url },
} as const;

export const SAYES_ART = { whistle: sWhistle.url, money: sMoney.url, disgusted: sDisgusted.url, smart: sSmart.url, smug: sSmug.url, portrait: sPortrait.url } as const;

export type SceneKey = keyof typeof SCENES;

export const PORTRAITS = {
  tarek: `${ART}tarek.webp`,
  sherif: `${ART}sherif.webp`,
  seif: `${ART}sherif.webp`,
  player: `${ART}player.webp`,
} as const;
