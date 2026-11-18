import { createFileRoute } from "@tanstack/react-router";
import Game from "@/game/Game";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The 600 Case — قضية الـ ٦٠٠ موظف" },
      {
        name: "description",
        content:
          "لعبة قرار: تقرير تدريب على مكتب المدير التنفيذي… هل العلاقة بين التدريب والأداء تكفي لزيادة الميزانية؟",
      },
      { property: "og:title", content: "The 600 Case — قضية الـ ٦٠٠ موظف" },
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
