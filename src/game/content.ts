import type { D1Id, FinalId, FolderId, TestId } from "./engine";

export type Speaker = "hr" | "manager";
export type Mood = "confident" | "thinking" | "surprised" | "happy" | "facepalm";
export interface Line { who: Speaker; text: string; mood?: Mood }

export const TITLE = "The 600 Case";
export const SUBTITLE_AR = "قضية الـ 600 موظف";
export const TAGLINE = "تقرير تدريب على مكتب المدير العام… وقرار مستني رأيك.";
export const RULES = "راجع التقرير، افتح الملفات، وقدّم دليلك قبل القرار النهائي. معاك ٣ نجوم مصداقية. كل اختيار ليه نتيجة.";
export const FICTION_NOTE = "سيناريو تدريبي افتراضي مبني على حالة HR";

export const DIALOGUE = {
  dialogueA: [
    { who: "hr", text: "باشا، عندي لك خبر حلو عن برنامج التدريب." },
    { who: "manager", text: "قول يا سيدي… محتاجين خبر حلو!", mood: "happy" },
    { who: "hr", text: "راجعنا بيانات ٦٠٠ موظف. اللي خدوا ساعات تدريب أكتر، تقييمات أدائهم كانت أعلى." },
    { who: "manager", text: "أهو ده الكلام! يعني التدريب جاب نتيجة؟", mood: "surprised" },
    { who: "hr", text: "التقرير بيبيّن علاقة واضحة بين ساعات التدريب والتقييمات." },
    { who: "manager", text: "حلو. جهّزلي طلب زيادة الميزانية… خلّينا نوسّع البرنامج.", mood: "confident" },
  ],
  dialogueC: [
    { who: "manager", text: "إيه يا جماعة، إحنا لسه في موضوع التدريب؟ أنا عندي ميتينج بعد عشر دقايق!", mood: "thinking" },
    { who: "hr", text: "التقرير زي ما هو يا فندم… ساعات تدريب أكتر، وتقييمات أعلى." },
    { who: "manager", text: "طيب ورّيني حاجة تغيّر طريقة فهمنا للتقرير.", mood: "confident" },
  ],
  dialogueD: [{ who: "manager", text: "ماشي. بس لو عايزين نعرف التدريب فرّق فعلًا… نعمل إيه؟", mood: "thinking" }],
  dialogueE: [{ who: "manager", text: "آخر كلام عندك إيه؟ أمضي على زيادة الميزانية ولا لأ؟", mood: "confident" }],
} satisfies Record<string, Line[]>;

export const D1_OPTIONS: Record<D1Id, { label: string; reaction: Line; note?: string }> = {
  approve_now: { label: "أوافق على زيادة الميزانية", reaction: { who: "manager", text: "تمام، هات القلم…", mood: "happy" }, note: "قرار متسرّع: لسه مفيش دليل إن التدريب هو السبب." },
  reject_now: { label: "أرفض زيادة الميزانية", reaction: { who: "manager", text: "نلغيها كده؟", mood: "surprised" }, note: "عدم إثبات التأثير مش معناه إثبات إن التدريب مالوش فايدة." },
  inspect_first: { label: "أراجع التقرير والبيانات الأول", reaction: { who: "manager", text: "ماشي… بس خلّصنا قبل الميتينج.", mood: "thinking" } },
};

export const FOLDER_CONTENT: Record<FolderId, { title: string; body: string[]; note: string; hr: string; manager: string }> = {
  selection: {
    title: "الترشيحات",
    body: ["مراجعة الترشيحات: الموظفون اللي تقييماتهم كانت مرتفعة من البداية، كانت فرص اختيارهم للتدريب أكبر."],
    note: "ده نمط اختيار محتمل، مش دليل إن التدريب بلا تأثير.",
    hr: "آه… فعلاً بعضهم كان تقييمه عالي قبل ما يترشح.",
    manager: "يعني ممكن كنا بنختار الشاطرين أصلًا.",
  },
  baseline: {
    title: "التقييمات السابقة",
    body: ["قبل التدريب: بعض الموظفين المتدربين كان أداؤهم مرتفع بالفعل", "بعد التدريب: تقييماتهم فضلت مرتفعة"],
    note: "التقييم النهائي لوحده ما يوضّحش مقدار التحسّن بسبب التدريب.",
    hr: "صح… لازم ناخد مستوى الأداء قبل التدريب في الحساب.",
    manager: "تمام، كده المقارنة مش بالبساطة دي.",
  },
  design: {
    title: "طريقة المقارنة",
    body: ["التقرير بيقارن ساعات التدريب بالتقييم النهائي، لكن ما فيهوش مقارنة موثوقة بين مجموعات متكافئة، ولا تصميم اختبار يعزل تأثير التدريب."],
    note: "معلومة ناقصة في التقرير، مش إثبات إن التدريب فشل.",
    hr: "فعلاً التقرير ما عزلش تأثير التدريب عن باقي العوامل.",
    manager: "يبقى الاستنتاج محتاج شغل زيادة.",
  },
};

export const CLAIM = "اللي اتدربوا أكتر كانوا أشطر بسبب التدريب.";

export const TEST_OPTIONS: Record<TestId, { label: string; feedback: string; mood: Mood }> = {
  compare_raw: { label: "نقارن تقييم اللي اتدربوا باللي ما اتدربوش", feedback: "المجموعتين ممكن يكونوا مختلفين من البداية، فالمقارنة لوحدها مش كفاية.", mood: "thinking" },
  before_after_only: { label: "نقارن نفس الموظفين قبل التدريب وبعده", feedback: "التحسّن ممكن يتأثر بعوامل تانية حصلت في نفس الفترة.", mood: "thinking" },
  fair_test: { label: "نقارن مجموعات متكافئة، والأفضل توزيع عشوائي لو ينفع", feedback: "تمام… كده بنحاول نعرف التدريب هو اللي فرّق ولا فيه عوامل تانية.", mood: "happy" },
};

export const FINAL_OPTIONS: Record<FinalId, { label: string }> = {
  final_expand: { label: "نزود الميزانية دلوقتي؛ التقرير أثبت إن التدريب هو السبب" },
  final_cancel: { label: "نلغي التدريب؛ التقرير أثبت إنه ملوش تأثير" },
  final_evaluate: { label: "نقيّم تأثير التدريب باختبار أقوى قبل ما نوسّع الميزانية" },
};

export const DEBRIEF = [
  { q: "شفنا إيه؟", a: "ساعات تدريب أكتر ارتبطت بتقييمات أعلى." },
  { q: "إيه اللي مش ثابت؟", a: "إن التدريب هو اللي سبب الفرق." },
  { q: "نحتاج إيه؟", a: "مقارنة أو اختبار أقوى يفرّق تأثير التدريب عن الاختلافات السابقة والعوامل التانية." },
];
