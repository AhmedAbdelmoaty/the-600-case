// Temporary art borrowed from The Analyst; swap the pointer files to change art without touching rules.
import cover from "./assets/cover.webp.asset.json";
import mark from "./assets/mark.png.asset.json";
import meetingL from "./assets/meeting-L.webp.asset.json";
import meetingP from "./assets/meeting-P.webp.asset.json";
import briefL from "./assets/brief-L.webp.asset.json";
import briefP from "./assets/brief-P.webp.asset.json";
import corridorL from "./assets/corridor-L.webp.asset.json";
import corridorP from "./assets/corridor-P.webp.asset.json";
import deskL from "./assets/desk-L.webp.asset.json";
import deskP from "./assets/desk-P.webp.asset.json";
import ceoL from "./assets/ceo-L.webp.asset.json";
import pSherif from "./assets/p-sherif.webp.asset.json";
import pTarek from "./assets/p-tarek.webp.asset.json";
import pPlayer from "./assets/p-player.webp.asset.json";

export const SCENES = {
  cover: { l: cover.url, p: cover.url },
  meeting: { l: meetingL.url, p: meetingP.url },
  brief: { l: briefL.url, p: briefP.url },
  corridor: { l: corridorL.url, p: corridorP.url },
  desk: { l: deskL.url, p: deskP.url },
  ceo: { l: ceoL.url, p: ceoL.url },
} as const;
export type SceneKey = keyof typeof SCENES;
export const PORTRAITS = { sherif: pSherif.url, tarek: pTarek.url, player: pPlayer.url } as const;
export const MARK = mark.url;
