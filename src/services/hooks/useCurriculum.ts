import { useEffect, useState } from "react";
import { fetchContact, listContact } from "../contact.ts";
import {
  fetchCatalogLessons,
  fetchCatalogNotes,
  fetchGrade,
  fetchGradeLessons,
  fetchGradeNotes,
  fetchGrades,
  fetchGradesByStage,
  fetchPulse,
  fetchStage,
  fetchStages,
  fetchSubjectsByGrade,
  listCatalogLessons,
  listCatalogNotes,
  listGrade,
  listGradeLessons,
  listGradeNotes,
  listGrades,
  listGradesByStage,
  listPulse,
  listStage,
  listStages,
  listSubjectsByGrade,
} from "../curriculum.ts";
import type { ContactProfile } from "../contact.ts";
import type {
  CatalogLesson,
  CatalogNote,
  Grade,
  PlatformPulse,
  Stage,
  Subject,
} from "../types.ts";

/**
 * Seeds from the local catalog for a stable first paint, then reads through
 * the async service. When Supabase replaces `fetch*`, start `seedFor` from
 * an empty value and let the request fill the page.
 */
function useCatalog<T>(key: string, seedFor: (key: string) => T, read: (key: string) => Promise<T>): T {
  const [value, setValue] = useState<T>(() => seedFor(key));
  const [seen, setSeen] = useState(key);

  if (seen !== key) {
    setSeen(key);
    setValue(seedFor(key));
  }

  useEffect(() => {
    let active = true;
    void read(key).then((next) => {
      if (active) setValue(next);
    });
    return () => {
      active = false;
    };
  }, [key, read, seedFor]);

  return value;
}

function seedStages(_key: string): Stage[] {
  return listStages();
}

function readStages(_key: string): Promise<Stage[]> {
  return fetchStages();
}

function seedGrades(_key: string): Grade[] {
  return listGrades();
}

function readGrades(_key: string): Promise<Grade[]> {
  return fetchGrades();
}

function seedCatalogNotes(_key: string): CatalogNote[] {
  return listCatalogNotes();
}

function readCatalogNotes(_key: string): Promise<CatalogNote[]> {
  return fetchCatalogNotes();
}

function seedCatalogLessons(_key: string): CatalogLesson[] {
  return listCatalogLessons();
}

function readCatalogLessons(_key: string): Promise<CatalogLesson[]> {
  return fetchCatalogLessons();
}

function seedPulse(_key: string): PlatformPulse {
  return listPulse();
}

function readPulse(_key: string): Promise<PlatformPulse> {
  return fetchPulse();
}

function seedContact(_key: string): ContactProfile {
  return listContact();
}

function readContact(_key: string): Promise<ContactProfile> {
  return fetchContact();
}

export function useStages(): Stage[] {
  return useCatalog("all", seedStages, readStages);
}

export function useStage(stageId: string): Stage | undefined {
  return useCatalog(stageId, listStage, fetchStage);
}

export function useGrades(): Grade[] {
  return useCatalog("all", seedGrades, readGrades);
}

export function useGradesByStage(stageId: string): Grade[] {
  return useCatalog(stageId, listGradesByStage, fetchGradesByStage);
}

export function useGrade(gradeId: string): Grade | undefined {
  return useCatalog(gradeId, listGrade, fetchGrade);
}

export function useSubjectsByGrade(gradeId: string): Subject[] {
  return useCatalog(gradeId, listSubjectsByGrade, fetchSubjectsByGrade);
}

export function useCatalogNotes(): CatalogNote[] {
  return useCatalog("notes", seedCatalogNotes, readCatalogNotes);
}

export function useCatalogLessons(): CatalogLesson[] {
  return useCatalog("lessons", seedCatalogLessons, readCatalogLessons);
}

export function useGradeNotes(gradeId: string): CatalogNote[] {
  return useCatalog(gradeId, listGradeNotes, fetchGradeNotes);
}

export function useGradeLessons(gradeId: string): CatalogLesson[] {
  return useCatalog(gradeId, listGradeLessons, fetchGradeLessons);
}

export function usePulse(): PlatformPulse {
  return useCatalog("pulse", seedPulse, readPulse);
}

export function useContact(): ContactProfile {
  return useCatalog("contact", seedContact, readContact);
}
