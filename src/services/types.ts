export type StageId = "primary" | "preparatory" | "secondary";

export type Stage = {
  id: StageId;
  index: string;
  kicker: string;
  title: string;
  summary: string;
};

export type Grade = {
  id: string;
  stageId: StageId;
  index: string;
  title: string;
  subtitle: string;
  isComingSoon?: boolean;
  dbId?: string;
};

export type CurriculumUnit = {
  id: string;
  gradeId: string;
  title: string;
  sortOrder: number;
  isComingSoon: boolean;
};

export type CurriculumLesson = {
  id: string;
  unitId: string;
  title: string;
  sortOrder: number;
  isComingSoon: boolean;
};

export type Subject = {
  id: string;
  gradeId: string;
  code: string;
  title: string;
  focus: string;
};

export type NoteKind = "ملخص" | "ورقة عمل";

export type ResourceCardVisual = {
  description: string;
  coverImage: string;
  cardColor: string;
  iconName: string;
  category: string;
  unitId: string;
  lessonId: string;
  isComingSoon: boolean;
};

export type Note = {
  id: string;
  subjectId: string;
  title: string;
  detail: string;
  kind: NoteKind;
  fileUrl: string;
  fileName: string;
} & ResourceCardVisual;

export type Lesson = {
  id: string;
  subjectId: string;
  title: string;
  detail: string;
  playlistId: string;
  videoUrl: string;
} & ResourceCardVisual;

export type CatalogNote = Note & {
  subjectTitle: string;
  subjectCode: string;
  gradeId: string;
  gradeTitle: string;
  stageId: StageId;
  stageTitle: string;
};

export type CatalogLesson = Lesson & {
  subjectTitle: string;
  subjectCode: string;
  gradeId: string;
  gradeTitle: string;
  stageId: StageId;
  stageTitle: string;
};

export type PlatformPulse = {
  grades: number;
  notes: number;
  playlists: number;
  stages: number;
};
