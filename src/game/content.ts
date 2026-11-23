import type { ClaimId, EvidenceId, QuestionId } from "./engine";

export type Speaker = "seif" | "tarek" | "player";
export type Mood = "confident" | "thinking" | "surprised" | "happy" | "facepalm";
export interface Line { who: Speaker; text: string; mood?: Mood; thought?: boolean }

export const TITLE = "Training Evaluation";
export const SUBTITLE_AR = "كورس تدريبي واحد.. مجموعتان.. وقرار مصيري مستني رأيك.";

export const BRIEF: Line[] = [{
  who: "seif",
  mood: "thinking",
  text: "دلوقتي الشركة عندنا متعاقدة مع شركة تدريب وقدمولنا كورس لمجموعتين من الموظفين من نفس الإدارة، تقييم المجموعة الأولى طلع 90% وبعدها لما المجموعة التانية أخدوا الكورس التقييم طلع 80%، ودلوقتي مش عارفين نجدد لنفس الشركة ولا نغيرها.. روح لطارق مدير التدريب افهم منه الصورة كاملة وقولي شايف الصح إيه.",
}];

export const MEETING: Line[] = [
  { who: "tarek", mood: "happy", text: "يا مرحب يا مرحب.. إيه الأخبار؟" },
  { who: "player", text: "تمام يا أستاذ طارق.. احكيلي كده القصة كلها من الأول خليني افهم." },
  { who: "tarek", mood: "confident", text: "شوف يا سيدي، إحنا قدمنا الكورس ده لمجموعتين من نفس الإدارة، والنتيجة كانت مجموعة A تقييمهم طلع 90% ومجموعة B تقييمهم طلع 80%. الاستبيان ده اتعمل في آخر محاضرة، وطبعاً زي ما أنت عارف بنحاول نملاه مع أكبر عدد ممكن من الناس، وواضح إن التقييم قل في المجموعة B عن A.. عايز أعرف ليه التقييم قل." },
  { who: "player", text: "تمام يا أستاذ طارق، هدخل مكتبي أراجع الأرقام وارجع لمستر سيف بالتوصية المظبوطة." },
];

export const THOUGHTS = {
  guess: "محتاج أعرف ليه التقييم قلّ من 90% لـ 80%؟",
  data: "💭 محتاج أبص على الداتا.. عشان الأرقام بتتكلم.",
  ask: "محتاج أسأل شوية أسئلة الأول عشان أفهم الوضع صح.",
} as const;

export const GUESSES = [
  { id: "trainer" as const, text: "المشكلة في المحاضر وطريقة شرحه." },
  { id: "trainees" as const, text: "المشكلة في المتدربين ومش متوفر فيهم المهارات الأساسية." },
  { id: "data" as const, text: "محتاج أبص على الداتا الأول عشان مفيش أي دليل واضح." },
];

export interface Metric {
  id: EvidenceId;
  label: string;
  labelAr: string;
  source: "LMS" | "Survey";
  a: number;
  b: number;
  unit?: "%";
  max: number;
  note: string;
}

export const METRICS_LIST: Metric[] = [
  { id: "participants", label: "Course Participants", labelAr: "إجمالي المشاركين في الكورس", source: "LMS", a: 50, b: 50, max: 60, note: "عدد المسجلين رسمياً في السيستم لكل مجموعة." },
  { id: "complaintsRate", label: "Complaints Rate", labelAr: "نسبة الشكاوى من المستجيبين", source: "Survey", a: 10, b: 20, unit: "%", max: 30, note: "نسبة من أبدوا ملاحظات سلبية من بين من ملأوا الاستبيان." },
  { id: "complaints", label: "Complaints Count", labelAr: "عدد الشكاوى المسجلة", source: "Survey", a: 3, b: 9, max: 12, note: "إجمالي الشكاوى الفردية المرصودة في نماذج الاستبيان." },
  { id: "satisfaction", label: "Satisfaction Score", labelAr: "درجة الرضا العامة", source: "Survey", a: 90, b: 80, unit: "%", max: 100, note: "متوسط تقييم جودة التدريب في الاستبيان الورقي." },
  { id: "attendance", label: "Attendance Rate", labelAr: "نسبة الحضور الفعلي", source: "LMS", a: 75, b: 95, unit: "%", max: 100, note: "سجلات الحضور عبر البصمة الإلكترونية للقاعات." },
  { id: "assignments", label: "Assignment Submission", labelAr: "تسليم الواجبات الدورية", source: "LMS", a: 35, b: 35, max: 50, note: "عدد المتدربين المسلمين للواجبات عبر منصة LMS." },
  { id: "projects", label: "Project Submission", labelAr: "تسليم المشاريع العملية", source: "LMS", a: 30, b: 35, max: 50, note: "المشاريع النهائية المعتمدة من مقيّم الدورة." },
  { id: "respondents", label: "Survey Respondents", labelAr: "عدد المشاركين في الاستبيان", source: "Survey", a: 30, b: 45, max: 60, note: "عدد النماذج المكتملة التي تم استلامها بنهاية المحاضرة الأخيرة." },
];

export const METRICS: Record<EvidenceId, Metric> = Object.fromEntries(METRICS_LIST.map((m) => [m.id, m])) as Record<EvidenceId, Metric>;

export const QUESTIONS: { id: QuestionId; text: string; shows?: EvidenceId; na?: boolean }[] = [
  { id: "respondents", text: "عايز أعرف عدد المشاركين في الاستبيان مقارنة بإجمالي المتدربين.", shows: "respondents" },
  { id: "complaintsOfAll", text: "عايز أعرف نسبة الشكاوى من إجمالي الحضور.", na: true },
  { id: "attendance", text: "عايز نسبة الحضور الفعلي للمجموعتين.", shows: "attendance" },
  { id: "complaintsCount", text: "عايز عدد الشكاوى اللي اترصدت في الاستبيان.", shows: "complaints" },
  { id: "allData", text: "عايز أبص على الداتا المتاحة." },
];

export const CLAIMS: Record<ClaimId, string> = {
  aBetter: "بعد مراجعة البيانات، مجموعة A أفضل من مجموعة B، وأوصي بالتواصل مع مقدم الخدمة التدريبية لحل أسباب انخفاض B عن A والتعهد بالحفاظ على جودة التدريب مع المجموعات المستقبلية وإلا فسخنا التعاقد.",
  bBetter: "بعد مراجعة البيانات، مجموعة B أفضل من مجموعة A، وأوصي بالتواصل مع مقدم الخدمة التدريبية لتطوير الأنشطة التفاعلية لزيادة نسبة الحضور.",
  equal: "بعد مراجعة الأرقام، الفريقين متساويين في المستوى، ولا توجد أي مشكلة.",
  notRep: "بعد مراجعة الأرقام، عدد المشاركين في الاستبيان لا يمثل المتدربين وخصوصاً في المجموعة A فمينفعش نقارن الفريقين بنتيجة الاستبيان دي؛ بسبب وجود تحيز الـ Survivorship Bias (العينة غير الممثلة)، وأوصي بإعادة التقييم بعينة كاملة قبل أي قرار.",
  trainer: "المشكلة في المحاضر وطريقة شرحه، وأوصي بتغيير المحاضر في الكورس القادم.",
  trainees: "المشكلة في المتدربين ومش متوفر فيهم المهارات الأساسية، وأوصي بمراجعة اختيار المرشحين.",
};

export const MISMATCH = "الدليل ده مش بيدعم الاستنتاج ده.. اختار الدليل اللي يسند كلامك صح.";
export const EMAIL_BODIES: Record<ClaimId, string> = { ...CLAIMS };

export interface Ending { stamp: string; lines: Line[]; title: string; desc: string }

export const WIN: Ending = {
  stamp: "قرار استراتيجي معتمد",
  title: "المحلل الاستراتيجي",
  desc: "كشفت تحيز العينة (Survivorship Bias) في التقييم وحميت الشركة من فسخ تعاقد ممتازة بناءً على أرقام وهمية!",
  lines: [{ who: "seif", mood: "happy", text: "الله ينور عليك! هو ده الشغل المظبوط.. فكرت صح وبدأت بالسؤال الصح، مغرقتش في الداتا والأرقام وخلاص ولحقت الشركة من قرار كارثي كان هيكلفنا تغيير شركة تدريب ممتازة!" }],
};

export const LOSS_GUESS: Ending = {
  stamp: "قرار متسرع",
  title: "المتسرع بالتخمين",
  desc: "ألقيت اللوم دون أي دليل أو مراجعة للأرقام.. القرارات الإدارية لا تُبنى على التخمين!",
  lines: [{ who: "seif", mood: "facepalm", text: "مين قالك إن التقييم قلّ أصلاً؟! إنت مبصتش على الأرقام ولا راجعت مين اللي شارك، ورميت اللوم كده وخلاص من غير أي دليل؟! لبستنا في الحيط وقرارك مبني على الهوا!" }],
};

export const LOSS_SUPERFICIAL: Ending = {
  stamp: "قرار كارثي",
  title: "ضحية الأرقام السطحية",
  desc: "غرقت في الأرقام الظاهرية وأخذت قراراً بالشبه.. لم تفحص تمثيل العينة وأوقعت الإدارة في حرج كبير!",
  lines: [{ who: "seif", mood: "facepalm", text: "يا باشا ميصحش كده! محلل البيانات يبدأ بالمشكلة ويحددها صح مش يغرق في البيانات على طول كده بالشبه! واخد قرار متسرع وعامل فيها مراجع، روح ذاكر تاني وتعالى!" }],
};

export const TIMEOUT: Ending = {
  stamp: "فات الميعاد!",
  title: "الغرقان في شبر مية",
  desc: "مستر سيف دخل الاجتماع بدون التوصية.. والقرار اتخذ في غيابك!",
  lines: [{ who: "seif", mood: "facepalm", text: "الوقت خلص والديدلاين عدى والاجتماع بدأ وإنت لسه محتار قدام الشاشة ومطلعتش بقرار.. كده عطلت الشركة والقرار اتاخد من غيرنا!" }],
};

export const SEIF_MESSAGES = [
  "يا بطل، اجتماع الشركة التانية كمان شوية ومستنيين قرارك.. طمني وصلت لإيه؟",
  "الوقت بيجري والاجتماع هيبدأ.. ابعتلي الإيميل فوراً عشان ألحق أقرأ توصيتك!",
];
