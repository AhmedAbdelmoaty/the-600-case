import type { D1Id, FinalId, FolderId, TestId } from "./engine";

export type Speaker = "ld" | "manager";
export type Mood = "confident" | "thinking" | "surprised" | "happy" | "facepalm";

export interface Line {
  who: Speaker;
  text: string;
  mood?: Mood;
}

export const TITLE = "The 600 Case";
export const INTRO_TITLE = "قضية الـ ٦٠٠ موظف";
export const SUBTITLE_AR = INTRO_TITLE;
export const TAGLINE = "تقرير تدريب على مكتب المدير التنفيذي.. وقرار مصيري مستني رأيك كمدير HR.";
export const INTRO_MISSION =
  "معاك ٣ نجوم ثقة ومصداقية عند الإدارة.. كل قرار متسرع بيخصم نجمة. فكّر قبل ما تقرر!";

export const DIALOGUE = {
  dialogueA: [
    {
      who: "ld",
      text: "يا باشا بشرة خير! حللنا بيانات ٦٠٠ موظف، وفيه علاقة واضحة جداً: كل ما ساعات التدريب تزيد، تقييم الأداء السنوي بيعلى في السما!",
      mood: "happy",
    },
    {
      who: "manager",
      text: "عظيم جداً.. يعني التدريب هو السر! جهّزلي طلب زيادة الميزانية نوسّع البرنامج فوراً!",
      mood: "happy",
    },
  ],
} satisfies Record<string, Line[]>;

export const D1_PROMPT = "الطلب على المكتب قدامك.. هتعمل إيه؟";

export const D1_OPTIONS: Record<D1Id, { label: string; reaction: Line; note?: string }> = {
  approve_now: {
    label: "أوافق على زيادة الميزانية فوراً",
    reaction: {
      who: "manager",
      text: "تمام.. هات القلم نخلّص!",
      mood: "happy",
    },
    note: "اتسرّعت! مجرد وجود علاقة في الأرقام مش دليل إن التدريب هو سبب زيادة الأداء.",
  },
  reject_now: {
    label: "أرفض زيادة الميزانية",
    reaction: {
      who: "manager",
      text: "نرفض كده فجأة؟!",
      mood: "surprised",
    },
    note: "اتسرّعت بدون دليل! عدم إثبات التأثير مش معناه إن التدريب فاشل ونلغيه فوراً.",
  },
  inspect_first: {
    label: "أراجع التقرير وبيانات الـ ٦٠٠ موظف الأول",
    reaction: {
      who: "manager",
      text: "عين العقل.. بس راجع بسرعة قبل الميتينج الجاي.",
      mood: "thinking",
    },
  },
};

export const FOLDER_CONTENT: Record<
  FolderId,
  { label: string; title: string; body: string; note: string }
> = {
  selection: {
    label: "الترشيحات",
    title: "ملف ترشيحات المديرين",
    body: "مراجعة السجلات كشفت إن المديرين كانوا بيرشحوا أصلاً الموظفين المتميزين وأصحاب الأداء العالي لكورسات وتدريبات أكتر.",
    note: "انحياز في الاختيار (Selection Bias): الشاطر اترشح أكتر، فطبيعي يفضل أداؤه عالي حتى بدون التدريب.",
  },
  ambition: {
    label: "طموح الموظفين",
    title: "ملف مبادرات الموظفين",
    body: "الموظفون الأكثر طموحاً ونشاطاً هما اللي كانوا بيسجلوا بنفسهم في ساعات تدريب إضافية، وهم بطبيعتهم متفوقين في شغلهم اليومي.",
    note: "عامل مشترك خفي: شطارة وطموح الموظف هما سبب ارتفاع ساعات التدريب والتقييم معاً.",
  },
  design: {
    label: "غياب المقارنة العادلة",
    title: "ملف طريقة المقارنة",
    body: "التقرير قارن ساعات التدريب بالتقييم النهائي بشكل عام، بدون عزل تأثير التدريب أو التأكد من تكافؤ المجموعات في الخبرة وطبيعة الشغل.",
    note: "غياب المجموعة الضابطة: منقدرش ننسب فرق الأداء للتدريب طالما المجموعتين مختلفتين من الأساس.",
  },
};

export const TEST_PROMPT =
  "راجعت الملفات كويس؟ تمام.. لو عايزين نثبت إن التدريب فرّق بجد مش مجرد صدفة، إيه خطتك؟";

export const TEST_OPTIONS: Record<TestId, { label: string; feedback: string; mood: Mood }> = {
  compare_raw: {
    label: "نقارن تقييم اللي اتدربوا باللي ما اتدربوش",
    feedback:
      "المجموعتين ممكن يكونوا مختلفين في الشطارة والخبرة من البداية، فالمقارنة دي غير عادلة.",
    mood: "thinking",
  },
  before_after_only: {
    label: "نقارن أداء نفس الموظفين قبل التدريب وبعده",
    feedback: "أي تحسن ممكن يكون سببه عوامل تانية حصلت في الشركة أو السوق خلال السنة مش التدريب.",
    mood: "thinking",
  },
  fair_test: {
    label: "نقارن مجموعات متكافئة ونوزع التدريب عشوائياً (A/B Test)",
    feedback: "الله ينور! كده هنعزل أثر التدريب عن أي عوامل تانية.",
    mood: "happy",
  },
};

export const FINAL_PROMPT = "آخر كلام عندك إيه؟ أمضي على زيادة الميزانية ولا لأ؟";

export const FINAL_OPTIONS: Record<FinalId, { label: string }> = {
  final_expand: {
    label: "نزود الميزانية دلوقتي؛ التقرير أثبت إن التدريب هو السبب",
  },
  final_cancel: {
    label: "نلغي التدريب خالص؛ التقرير أثبت إنه ملوش لازمة",
  },
  final_evaluate: {
    label: "نعمل تجربة منضبطة الأول ونقيس الأثر الحقيقي قبل أي توسع",
  },
};

export const DEBRIEF = [
  {
    q: "الارتباط مش سببية",
    a: "ارتفاع التدريب والأداء مع بعض ما يثبتش إن واحد منهم هو سبب التاني.",
  },
  {
    q: "اسأل مين اختار مين",
    a: "الترشيح والطموح ممكن يخلّوا الموظف الشاطر ياخد تدريب أكتر من البداية.",
  },
  {
    q: "صمّم مقارنة عادلة",
    a: "مجموعات متكافئة وتوزيع عشوائي يقرّبونا من قياس الأثر الحقيقي.",
  },
];

export const WIN_RANKS: Record<1 | 2 | 3, { title: string; note: string }> = {
  3: { title: "محلل استراتيجي داهية ⭐⭐⭐", note: "علامة كاملة" },
  2: { title: "محلل ذكي ومحسوب ⭐⭐", note: "أداء ممتاز" },
  1: { title: "محلل أنقذ الموقف في الوقت المناسب ⭐", note: "" },
};

export const LOSS_EXPLANATIONS: Record<"final_expand" | "final_cancel", string> = {
  final_expand:
    "وقعت في فخ الارتباط! افترضت إن التدريب هو سبب النجاح، مع إن الموظفين كانوا متميزين وشطار من الأساس.",
  final_cancel:
    "وقعت في فخ التسرع! عدم كفاية التقرير مش معناه إن التدريب فاشل.. القرار الصح هو القياس المنضبط.",
};
