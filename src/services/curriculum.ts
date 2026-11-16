import type {
  CatalogLesson,
  CatalogNote,
  Grade,
  Lesson,
  Note,
  PlatformPulse,
  Stage,
  StageId,
  Subject,
} from "./types.ts";

/**
 * Libyan curriculum catalog: stage → grade → subject → note/lesson.
 * Replace `fetch*` with Supabase queries. Keep return shapes stable.
 */

const SAMPLE_NOTE = "/notes/sample-note.pdf";
const SAMPLE_PLAYLIST = "PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab";

const stages: Stage[] = [
  {
    id: "primary",
    index: "01",
    kicker: "التأسيس",
    title: "المرحلة الابتدائية",
    summary: "من الصف الأول إلى السادس. قراءة وكتابة وحساب في مسار هادئ.",
  },
  {
    id: "preparatory",
    index: "02",
    kicker: "الإعداد",
    title: "المرحلة الإعدادية",
    summary: "الصفوف السابع والثامن والتاسع قبل عبور الثانوية.",
  },
  {
    id: "secondary",
    index: "03",
    kicker: "التخصص",
    title: "المرحلة الثانوية",
    summary: "أول ثانوي، ثم المساران العلمي والأدبي في الثاني والثالث.",
  },
];

const grades: Grade[] = [
  { id: "primary-1", stageId: "primary", index: "01", title: "الصف الأول", subtitle: "بداية الحروف والأعداد" },
  { id: "primary-2", stageId: "primary", index: "02", title: "الصف الثاني", subtitle: "تثبيت القراءة والحساب" },
  { id: "primary-3", stageId: "primary", index: "03", title: "الصف الثالث", subtitle: "توسيع الفهم الأساسي" },
  { id: "primary-4", stageId: "primary", index: "04", title: "الصف الرابع", subtitle: "انتقال إلى مواد أوضح" },
  { id: "primary-5", stageId: "primary", index: "05", title: "الصف الخامس", subtitle: "بناء الاستقلال الدراسي" },
  { id: "primary-6", stageId: "primary", index: "06", title: "الصف السادس", subtitle: "ختام المرحلة الابتدائية" },
  { id: "prep-1", stageId: "preparatory", index: "01", title: "أول إعدادي", subtitle: "الصف السابع" },
  { id: "prep-2", stageId: "preparatory", index: "02", title: "ثاني إعدادي", subtitle: "الصف الثامن" },
  { id: "prep-3", stageId: "preparatory", index: "03", title: "ثالث إعدادي", subtitle: "الصف التاسع" },
  { id: "sec-1", stageId: "secondary", index: "01", title: "صف أول ثانوي", subtitle: "سنة التأسيس الثانوي" },
  { id: "sec-2-science", stageId: "secondary", index: "02", title: "صف ثاني ثانوي علمي", subtitle: "المسار العلمي" },
  { id: "sec-2-arts", stageId: "secondary", index: "03", title: "صف ثاني ثانوي أدبي", subtitle: "المسار الأدبي" },
  { id: "sec-3-science", stageId: "secondary", index: "04", title: "صف ثالث ثانوي علمي", subtitle: "السنة الختامية · علمي" },
  { id: "sec-3-arts", stageId: "secondary", index: "05", title: "صف ثالث ثانوي أدبي", subtitle: "السنة الختامية · أدبي" },
];

/** One subject per grade keeps the catalog light while every workspace has content. */
const subjects: Subject[] = grades.map((grade) => {
  const science = grade.id.includes("science");
  const arts = grade.id.includes("arts");
  if (science) {
    return {
      id: `${grade.id}-math`,
      gradeId: grade.id,
      code: "MA",
      title: "الرياضيات",
      focus: "الدوال والتحليل",
    };
  }
  if (arts) {
    return {
      id: `${grade.id}-arabic`,
      gradeId: grade.id,
      code: "AR",
      title: "اللغة العربية",
      focus: "النصوص والبلاغة",
    };
  }
  if (grade.stageId === "preparatory") {
    return {
      id: `${grade.id}-science`,
      gradeId: grade.id,
      code: "SC",
      title: "العلوم",
      focus: "مفاهيم العلوم العامة",
    };
  }
  return {
    id: `${grade.id}-arabic`,
    gradeId: grade.id,
    code: "AR",
    title: "اللغة العربية",
    focus: "قراءة وكتابة",
  };
});

const notes: Note[] = subjects.map((subject, index) => {
  const kind = index % 2 === 0 ? "ملخص" : "ورقة عمل";
  return {
    id: `note-${subject.id}`,
    subjectId: subject.id,
    kind,
    title: `${kind} ${subject.title}`,
    detail: "ورقة واحدة لتجربة المعاينة داخل الصفحة والتنزيل المباشر.",
    fileUrl: SAMPLE_NOTE,
    fileName: "tariq-note-preview.pdf",
    description: "ورقة واحدة لتجربة المعاينة داخل الصفحة والتنزيل المباشر.",
    coverImage: "",
    cardColor: "#0f766e",
    iconName: "file-text",
  };
});

const lessons: Lesson[] = subjects.map((subject) => ({
  id: `lesson-${subject.id}`,
  subjectId: subject.id,
  title: `شرح ${subject.title}`,
  detail: "قائمة تشغيل تجريبية داخل المشغّل، وتُستبدل بشرح المادة لاحقاً.",
  playlistId: SAMPLE_PLAYLIST,
  videoUrl: `https://www.youtube.com/playlist?list=${SAMPLE_PLAYLIST}`,
  description: "قائمة تشغيل تجريبية داخل المشغّل، وتُستبدل بشرح المادة لاحقاً.",
  coverImage: "",
  cardColor: "#0f766e",
  iconName: "play-circle",
}));

function gradeContext(gradeId: string) {
  const grade = grades.find((item) => item.id === gradeId);
  const stage = stages.find((item) => item.id === grade?.stageId);
  return { grade, stage };
}

function subjectContext(subjectId: string) {
  const subject = subjects.find((item) => item.id === subjectId);
  const { grade, stage } = gradeContext(subject?.gradeId ?? "");
  return { subject, grade, stage };
}

export function listStages(): Stage[] {
  return stages;
}

export function listStage(stageId: string): Stage | undefined {
  return stages.find((stage) => stage.id === stageId);
}

export function listGrades(): Grade[] {
  return grades;
}

export function listGradesByStage(stageId: string): Grade[] {
  return grades.filter((grade) => grade.stageId === (stageId as StageId));
}

export function listGrade(gradeId: string): Grade | undefined {
  return grades.find((grade) => grade.id === gradeId);
}

export function listSubjectsByGrade(gradeId: string): Subject[] {
  return subjects.filter((subject) => subject.gradeId === gradeId);
}

export function listSubject(subjectId: string): Subject | undefined {
  return subjects.find((subject) => subject.id === subjectId);
}

export function listNotes(subjectId: string): Note[] {
  return notes.filter((note) => note.subjectId === subjectId);
}

export function listLessons(subjectId: string): Lesson[] {
  return lessons.filter((lesson) => lesson.subjectId === subjectId);
}

export function listCatalogNotes(): CatalogNote[] {
  return notes.flatMap((note) => {
    const { subject, grade, stage } = subjectContext(note.subjectId);
    if (!subject || !grade || !stage) return [];
    return [
      {
        ...note,
        subjectTitle: subject.title,
        subjectCode: subject.code,
        gradeId: grade.id,
        gradeTitle: grade.title,
        stageId: stage.id,
        stageTitle: stage.title,
      },
    ];
  });
}

export function listCatalogLessons(): CatalogLesson[] {
  return lessons.flatMap((lesson) => {
    const { subject, grade, stage } = subjectContext(lesson.subjectId);
    if (!subject || !grade || !stage) return [];
    return [
      {
        ...lesson,
        subjectTitle: subject.title,
        subjectCode: subject.code,
        gradeId: grade.id,
        gradeTitle: grade.title,
        stageId: stage.id,
        stageTitle: stage.title,
      },
    ];
  });
}

export function listGradeNotes(gradeId: string): CatalogNote[] {
  return listCatalogNotes().filter((note) => note.gradeId === gradeId);
}

export function listGradeLessons(gradeId: string): CatalogLesson[] {
  return listCatalogLessons().filter((lesson) => lesson.gradeId === gradeId);
}

export function listPulse(): PlatformPulse {
  return {
    stages: stages.length,
    grades: grades.length,
    notes: notes.length,
    playlists: lessons.length,
  };
}

export function fetchStages(): Promise<Stage[]> {
  return Promise.resolve(listStages());
}

export function fetchStage(stageId: string): Promise<Stage | undefined> {
  return Promise.resolve(listStage(stageId));
}

export function fetchGrades(): Promise<Grade[]> {
  return Promise.resolve(listGrades());
}

export function fetchGradesByStage(stageId: string): Promise<Grade[]> {
  return Promise.resolve(listGradesByStage(stageId));
}

export function fetchGrade(gradeId: string): Promise<Grade | undefined> {
  return Promise.resolve(listGrade(gradeId));
}

export function fetchSubjectsByGrade(gradeId: string): Promise<Subject[]> {
  return Promise.resolve(listSubjectsByGrade(gradeId));
}

export function fetchSubject(subjectId: string): Promise<Subject | undefined> {
  return Promise.resolve(listSubject(subjectId));
}

export function fetchNotes(subjectId: string): Promise<Note[]> {
  return Promise.resolve(listNotes(subjectId));
}

export function fetchLessons(subjectId: string): Promise<Lesson[]> {
  return Promise.resolve(listLessons(subjectId));
}

export function fetchCatalogNotes(): Promise<CatalogNote[]> {
  return Promise.resolve(listCatalogNotes());
}

export function fetchCatalogLessons(): Promise<CatalogLesson[]> {
  return Promise.resolve(listCatalogLessons());
}

export function fetchGradeNotes(gradeId: string): Promise<CatalogNote[]> {
  return Promise.resolve(listGradeNotes(gradeId));
}

export function fetchGradeLessons(gradeId: string): Promise<CatalogLesson[]> {
  return Promise.resolve(listGradeLessons(gradeId));
}

export function fetchPulse(): Promise<PlatformPulse> {
  return Promise.resolve(listPulse());
}
