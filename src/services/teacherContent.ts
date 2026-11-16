import type { StageId } from "./types.ts";

export type PacingWeek = {
  week: number;
  titleAr: string;
  titleEn: string;
  focusAr: string;
  focusEn: string;
};

export type TeacherTemplate = {
  id: string;
  titleAr: string;
  titleEn: string;
  detailAr: string;
  detailEn: string;
  kind: "plan" | "exam" | "rubric";
  fileName: string;
};

export type DigitalTool = {
  id: string;
  titleAr: string;
  titleEn: string;
  detailAr: string;
  detailEn: string;
  href: string;
};

export type SupervisorNote = {
  id: string;
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
};

export const supervisorNotes: SupervisorNote[] = [
  {
    id: "sup-1",
    titleAr: "تذكير: توزيع الفصل الأول",
    titleEn: "Reminder: Term 1 pacing",
    bodyAr: "يرجى الالتزام بالتوزيع المعتمد للأسبوعين القادمين، مع توثيق أي تعويض داخل المفكرة.",
    bodyEn: "Please follow the approved pacing for the next two weeks and log any make-up sessions in the planner.",
  },
  {
    id: "sup-2",
    titleAr: "نماذج الامتحانات جاهزة",
    titleEn: "Exam templates ready",
    bodyAr: "تم رفع نماذج هيكل الورقة والروبرك وفق المعايير الليبية داخل قسم النماذج.",
    bodyEn: "Paper structures and rubrics aligned with Libyan standards are now available in Templates.",
  },
];

export const pacingByStage: Record<StageId, PacingWeek[]> = {
  primary: [
    { week: 1, titleAr: "تأسيس القراءة والأعداد", titleEn: "Reading & numbers foundation", focusAr: "حروف، مقاطع، وعدّ حتى ٢٠.", focusEn: "Letters, syllables, counting to 20." },
    { week: 2, titleAr: "قراءة موجهة وحساب بسيط", titleEn: "Guided reading & simple arithmetic", focusAr: "جمل قصيرة وجمع وطرح أساسي.", focusEn: "Short sentences with basic add/subtract." },
    { week: 3, titleAr: "فهم النص والأنماط", titleEn: "Comprehension & patterns", focusAr: "أسئلة فهم وأنماط عددية بسيطة.", focusEn: "Comprehension questions and number patterns." },
    { week: 4, titleAr: "مراجعة وتقويم تكويني", titleEn: "Review & formative check", focusAr: "بطاقة ملاحظة أسبوعية قصيرة.", focusEn: "Short weekly observation card." },
  ],
  preparatory: [
    { week: 1, titleAr: "مفاهيم العلوم واللغة", titleEn: "Science & language concepts", focusAr: "مصطلحات أساسية وتجارب صفية قصيرة.", focusEn: "Core terms and short classroom demos." },
    { week: 2, titleAr: "حل مسائل وتمثيل", titleEn: "Problem solving & representation", focusAr: "مسائل متعددة الخطوات وتمثيل بياني مبسّط.", focusEn: "Multi-step problems and simple charts." },
    { week: 3, titleAr: "قراءة تحليلية", titleEn: "Analytical reading", focusAr: "استخراج فكرة رئيسة وأدلة من النص.", focusEn: "Main idea and evidence from text." },
    { week: 4, titleAr: "تقويم مرحلي", titleEn: "Checkpoint assessment", focusAr: "اختبار قصير + تصحيح جماعي.", focusEn: "Short quiz with whole-class review." },
  ],
  secondary: [
    { week: 1, titleAr: "تأسيس المسار", titleEn: "Track foundation", focusAr: "مراجعة متطلبات علمي/أدبي حسب الصف.", focusEn: "Review science/arts track prerequisites." },
    { week: 2, titleAr: "تطبيقات مركّزة", titleEn: "Focused applications", focusAr: "تمارين امتحانية قصيرة وربط بالمفاهيم.", focusEn: "Exam-style drills linked to concepts." },
    { week: 3, titleAr: "تحليل ونقاش", titleEn: "Analysis & discussion", focusAr: "أسئلة مقالية قصيرة أو مسائل تحليلية.", focusEn: "Short essays or analytical problems." },
    { week: 4, titleAr: "محاكاة امتحان", titleEn: "Exam simulation", focusAr: "ورقة تجريبية بمعايير الوقت والدرجات.", focusEn: "Timed practice paper with scoring criteria." },
  ],
};

export const teacherTemplates: TeacherTemplate[] = [
  {
    id: "tpl-daily",
    titleAr: "نموذج التحضير اليومي",
    titleEn: "Daily lesson plan template",
    detailAr: "هدف، وسائل، خطوات، وتقويم تكويني وفق الهيكل المعتمد.",
    detailEn: "Objective, materials, steps, and formative check in the approved structure.",
    kind: "plan",
    fileName: "tariq-daily-lesson-plan.txt",
  },
  {
    id: "tpl-exam",
    titleAr: "هيكل ورقة الامتحان",
    titleEn: "Exam paper structure",
    detailAr: "أقسام موضوعية ومقالية مع توزيع درجات مقترح.",
    detailEn: "Objective and written sections with a suggested mark distribution.",
    kind: "exam",
    fileName: "tariq-exam-structure.txt",
  },
  {
    id: "tpl-rubric",
    titleAr: "روبرك التصحيح",
    titleEn: "Grading rubric",
    detailAr: "معايير واضحة للأداء من ممتاز إلى يحتاج دعم.",
    detailEn: "Clear performance criteria from excellent to needs support.",
    kind: "rubric",
    fileName: "tariq-grading-rubric.txt",
  },
];

export const digitalTools: DigitalTool[] = [
  {
    id: "tool-board",
    titleAr: "سبورة تفاعلية",
    titleEn: "Interactive whiteboard",
    detailAr: "إرشادات سريعة لعرض الدرس رقمياً داخل الصف.",
    detailEn: "Quick guidance for presenting the lesson digitally in class.",
    href: "https://jamboard.google.com/",
  },
  {
    id: "tool-quiz",
    titleAr: "مولّد اختبارات قصيرة",
    titleEn: "Quiz generator",
    detailAr: "إنشاء أسئلة سريعة للتقويم التكويني.",
    detailEn: "Build short formative checks in minutes.",
    href: "https://kahoot.com/",
  },
  {
    id: "tool-slides",
    titleAr: "عروض متعددة الوسائط",
    titleEn: "Multimedia presentations",
    detailAr: "قواعد بسيطة لشرائح واضحة ومركّزة.",
    detailEn: "Simple rules for clear, focused slides.",
    href: "https://www.canva.com/",
  },
];

export const scheduleSlots = ["1", "2", "3", "4", "5", "6"] as const;
export const weekDaysAr = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس"] as const;
export const weekDaysEn = ["Sun", "Mon", "Tue", "Wed", "Thu"] as const;

export function templateBlob(template: TeacherTemplate, locale: "ar" | "en") {
  const title = locale === "en" ? template.titleEn : template.titleAr;
  const detail = locale === "en" ? template.detailEn : template.detailAr;
  const body =
    locale === "en"
      ? `${title}\n\n${detail}\n\n— Tariq Platform · Teacher's Space\nFill in: Objective / Materials / Steps / Assessment`
      : `${title}\n\n${detail}\n\n— منصة طارق · مساحة المعلم\nاملأ: الهدف / الوسائل / الخطوات / التقويم`;
  return new Blob([body], { type: "text/plain;charset=utf-8" });
}
