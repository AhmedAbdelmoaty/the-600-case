import { createFileRoute } from "@tanstack/react-router";
import Game from "@/game/Game";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Training Evaluation" },
      {
        name: "description",
        content:
          "لعبة تحليل قرار: مجموعتان أخدوا نفس الكورس، لكن هل التقييم وحده كفاية عشان نحكم؟",
      },
      { property: "og:title", content: "Training Evaluation" },
      {
        property: "og:description",
        content: "اسأل صح، راجع العينة، وابعت توصيتك قبل الاجتماع.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Game,
});
