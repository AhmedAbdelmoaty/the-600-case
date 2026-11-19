import { createFileRoute } from "@tanstack/react-router";
import Game from "@/game/Game";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Training Budget Case" },
      {
        name: "description",
        content:
          "لعبة قرار: تقرير تدريب على مكتب المدير التنفيذي… هل العلاقة بين التدريب والأداء تكفي لزيادة الميزانية؟",
      },
      { property: "og:title", content: "Training Budget Case" },
      {
        property: "og:description",
        content: "راجع الأدلة وقرّر قبل ما المدير يمضي على زيادة ميزانية التدريب.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Game,
});
