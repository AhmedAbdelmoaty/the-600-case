// Script text for "Training Budget Case" V3. Natural Egyptian Arabic; no answer leaks before the choice.
import type { ClaimId, EvidenceId, QuestionId } from "./engine";

export type Speaker = "sherif" | "tarek" | "player";
export type Mood = "confident" | "thinking" | "surprised" | "happy" | "facepalm";
export interface Line { who: Speaker; text: string; mood?: Mood; thought?: boolean }

export const TITLE = "Training Budget Case";
export const SUBTITLE_AR = "كورسين.. وتقييمين.. وقرار مستني رأيك.";

export const BRIEF: Line[] = [
  { who: "sherif", mood: "thinking", text: "يا بطل، الشركة لسه مخلصة كورسين لفرقتين A و B.. تقييم A طالع 90% و B طالع 80%، والإدارة متلخبطة ومش عارفين نجدد لنفس الشركة ولا نغيرها.. روح لطارق مدير التدريب افهم منه الصورة كاملة وتعالى اديني قرارك." },
];
export const ROAD: Line = { who: "player", thought: true, text: "شريف محتار بين الـ 90% والـ 80% وعايز قرار حاسم بخصوص التجديد.. لما أروح لطارق وأفهم الحكاية الأول." };
export const MEETING: Line[] = [
  { who: "tarek", mood: "happy", text: "يا مرحب يا مرحب.. إيه الأخبار؟" },
  { who: "player", text: "تمام يا أ. طارق.. م. شريف كلمني وقال لي إنك مجهز تقييم كورسين A و B، فاحكيلي كده القصة من الأول." },
  { who: "tarek", mood: "confident", text: "شوف يا سيدي، الكورسين كانوا زي الفل، والنتيجة واضحة: فريق A راضيين بنسبة 90%، وفريق B طالعين بـ 80%.. الاستبيان ده اتعمل في آخر محاضرة، وطبعاً مش كل الناس بتملاه، بس النتيجة بتنطق، فريق A مبسوطين جداً!" },
  { who: "player", text: "تمام يا أستاذ طارق، هطلع على مكتبي أراجع الأرقام كده واديك القرار المظبوط." },
];

export const THOUGHTS = {
  guess: "محتاج أعرف ليه التقييم قلّ من 90% لـ 80%؟",
  data: "محتاج أبص على الداتا.. عشان الأرقام مبتكدبش.",
  ask: "محتاج أسأل شوية أسئلة الأول عشان أفهم الوضع صح.",
} as const;

export const GUESSES = [
  { id: "trainer" as const, text: "المشكلة في المحاضر وطريقة شرحه." },
  { id: "trainees" as const, text: "المشكلة في المتدربين ومش متوفر فيهم المهارات الأساسية." },
  { id: "data" as const, text: "محتاج أبص على الداتا الأول عشان مفيش أي دليل واضح." },
];

export interface Metric { label: string; source: "LMS" | "Survey"; a: number; b: number; unit?: "%"; max: number; note?: string }
export const METRICS: Record<EvidenceId, Metric> = {
  participants: { label: "Course Participants", source: "LMS", a: 50, b: 50, max: 50 },
  attendance: { label: "Attendance Rate", source: "LMS", a: 75, b: 95, unit: "%", max: 100 },
  assignments: { label: "Assignment Submission", source: "LMS", a: 35, b: 35, max: 50 },
  projects: { label: "Project Submission", source: "LMS", a: 30, b: 35, max: 50 },
  satisfaction: { label: "Satisfaction Score", source: "Survey", a: 90, b: 80, unit: "%", max: 100 },
  complaints: { label: "Complaints Count", source: "Survey", a: 3, b: 9, max: 10 },
  complaintsRate: { label: "Complaints Rate", source: "Survey", a: 10, b: 20, unit: "%", max: 100 },
  respondents: { label: "Survey Respondents", source: "Survey", a: 30, b: 45, max: 50 },
};

export const QUESTIONS: { id: QuestionId; text: string; shows?: EvidenceId; na?: boolean }[] = [
  { id: "respondents", text: "عايز أعرف عدد المشاركين في الاستبيان مقارنة بإجمالي المتدربين.", shows: "respondents" },
  { id: "complaintsOfAll", text: "عايز أعرف نسبة الشكاوى من إجمالي الحضور.", na: true },
  { id: "attendance", text: "عايز نسبة الحضور الفعلي للمجموعتين.", shows: "attendance" },
  { id: "complaintsCount", text: "عايز عدد الشكاوى اللي اترصدت في الاستبيان.", shows: "complaints" },
  { id: "allData", text: "عايز أبص على كل الداتا المتاحة مرة واحدة." },
];

export const CLAIMS: Record<ClaimId, string> = {
  aBetter: "فريق A أفضل من فريق B",
  bBetter: "فريق B أفضل من فريق A",
  equal: "الفريقين متساويين في المستوى",
  notRep: "عدد المشاركين في الاستبيان لا يمثل المتدربين",
  trainer: "المشكلة في المحاضر وطريقة شرحه",
  trainees: "المشكلة في المتدربين ومهاراتهم الأساسية",
};
export const MISMATCH = "الدليل ده مش بيدعم الاستنتاج ده.. اختار الدليل اللي يسند كلامك.";

export const EMAIL_BODIES: Record<ClaimId, string> = {
  aBetter: "بعد مراجعة الأرقام، فريق A أفضل من فريق B، وأوصي بمراجعة التعاقد مع شركة تدريب فريق B.",
  bBetter: "بعد مراجعة الأرقام، فريق B أفضل من فريق A، وأوصي بمراجعة التعاقد مع شركة تدريب فريق A.",
  equal: "بعد مراجعة الأرقام، الفريقين متساويين في المستوى، وأوصي بالتجديد للشركتين زي ما هما.",
  notRep: "بعد مراجعة الأرقام، عدد المشاركين في الاستبيان لا يمثل المتدربين، فمينفعش نقارن الفريقين بنتيجة الاستبيان دي. أوصي بإعادة التقييم بعينة كاملة قبل أي قرار تجديد أو تغيير.",
  trainer: "المشكلة في المحاضر وطريقة شرحه، وأوصي بتغيير المحاضر في الكورس الجاي.",
  trainees: "المشكلة في المتدربين ومش متوفر فيهم المهارات الأساسية، وأوصي بمراجعة اختيار المرشحين.",
};

export interface Ending { stamp: string; lines: Line[]; title: string; desc: string }
export const WIN: Ending = {
  stamp: "قرار معتمد",
  title: "داهية الـ HR وحامي الميزانية",
  desc: "مفيش رقم بيعدي عليك بالساهل! قفشت اللعبة وكشفت تحيز الاستبيان، وتستحق تاخد بونص من جيب شريف شخصياً.",
  lines: [
    { who: "sherif", mood: "happy", text: "الله ينور عليك يا مدير! هو ده الشغل اللي يفرّق الـ HR الفاهم عن اللي بيبص للأرقام على عماها! يعني الـ 90% دي كانت وهم عشان ربع الفريق طفش ومملاش الاستبيان؟! وفرت على الشركة قرار كارثي كان هيكلفنا تغيير شركة تدريب ممتازة لمجرد إنها كانت صارمة!" },
    { who: "tarek", text: "فعلاً الناس كانت مستعجلة في آخر محاضرة.. نقطة في الجون يا بطل!" },
  ],
};
export const LOSS: Ending = {
  stamp: "قرار كارثي",
  title: "المبهور بالباوربوينت",
  desc: "أول ما شوفت أرقام وشارتات قولت بس كسرنا التارجت! أخدت القرار بالشبه من على الوش، والإدارة دلوقتي بتدور عليك بالسكاكين!",
  lines: [
    { who: "sherif", mood: "facepalm", text: "إيه العك الإداري اللي أنت باعته ده يا فندم؟! إحنا جايبين محلل بيانات وHR عشان يبص على الأرقام بالشبه ومن على الوش؟! أنت داخل ترمي قرارات وتلبسنا في الحيط من غير ما تفهم اللي ورا الأرقام! لو كنا دخلنا مجلس الإدارة بالتوصية دي كان زماننا بنوزع مناديل جنب الشركة!" },
    { who: "tarek", text: "أنا قولت برضه سيبك من الداتا وخلينا في البركة.. كده لبستنا في حيط خرسانة يا ريس!" },
  ],
};
export const TIMEOUT: Ending = {
  stamp: "فات الميعاد!",
  title: "الغرقان في شبر مية",
  desc: "شريف قفل الميزانية ولبس في الحيط.. وأنت لسه محتار تبعت الإيميل بـ Kind regards ولا Best regards!",
  lines: [
    { who: "sherif", mood: "facepalm", text: "قاعدين مستنيين التوصية وحضرتك سرحان وبتفكر كأنك بتخترع الذرة! الوقت عدّى والمالية قفلت الميزانية وعملوا اللي في دماغهم! التحليل الصح اللي يجي بعد فوات الأوان ميسواش تمن الورقة اللي اتطبع عليها!" },
    { who: "tarek", text: "كده راحت علينا كلنا.. شكراً يا هندسة على التأخير!" },
  ],
};

export const SHERIF_MESSAGES = [
  "يا بطل، طارق خلص عرضه ومستنيين إيميلك عشان نقفل الميزانية.",
  "الوقت بيجري والمالية هتقفل السيستم.. ابعتلي الإيميل فوراً علشان ألحق أبص فيه!",
];

export const TAKEAWAYS = [
  { q: "اللي ظهر", a: "فريق A راضي 90% وفريق B راضي 80%." },
  { q: "اللي كان مستخبي", a: "اللي ملوا الاستبيان في A كانوا 30 من 50 بس، وفي B كانوا 45 من 50." },
  { q: "القاعدة", a: "قبل ما تقارن نسبتين، اتأكد إن اللي جاوبوا يمثلوا كل الناس." },
];
