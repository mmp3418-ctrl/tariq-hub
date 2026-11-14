import { useCatalogStore } from "../CatalogProvider.tsx";
import type { CatalogLesson, CatalogNote, Grade, PlatformPulse, Stage, Subject } from "../types.ts";
import type { ContactProfile } from "../contact.ts";
import { listContact } from "../contact.ts";
import { useEffect, useState } from "react";
import { fetchContact } from "../contact.ts";

export function useStages(): Stage[] {
  return useCatalogStore().stages;
}

export function useStage(stageId: string): Stage | undefined {
  return useCatalogStore().stages.find((stage) => stage.id === stageId);
}

export function useGrades(): Grade[] {
  return useCatalogStore().grades;
}

export function useGradesByStage(stageId: string): Grade[] {
  return useCatalogStore().gradesByStage(stageId);
}

export function useGrade(gradeId: string): Grade | undefined {
  return useCatalogStore().gradeById(gradeId);
}

export function useSubjectsByGrade(gradeId: string): Subject[] {
  return useCatalogStore().subjectsByGrade(gradeId);
}

export function useCatalogNotes(): CatalogNote[] {
  return useCatalogStore().notes;
}

export function useCatalogLessons(): CatalogLesson[] {
  return useCatalogStore().lessons;
}

export function useGradeNotes(gradeId: string): CatalogNote[] {
  return useCatalogStore().notesByGrade(gradeId);
}

export function useGradeLessons(gradeId: string): CatalogLesson[] {
  return useCatalogStore().lessonsByGrade(gradeId);
}

export function usePulse(): PlatformPulse {
  return useCatalogStore().pulse;
}

export function useAnnouncements() {
  return useCatalogStore().announcements;
}

export function useCatalogSource() {
  const { source, ready } = useCatalogStore();
  return { source, ready };
}

export function useContact(): ContactProfile {
  const [value, setValue] = useState<ContactProfile>(() => listContact());
  useEffect(() => {
    let active = true;
    void fetchContact().then((next) => {
      if (active) setValue(next);
    });
    return () => {
      active = false;
    };
  }, []);
  return value;
}
