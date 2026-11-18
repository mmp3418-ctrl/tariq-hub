import type { CatalogNote } from "../services/types.ts";

export type LibraryPdfGroupId = "books" | "notes" | "worksheets";

export type LibraryPdfGroup = {
  id: LibraryPdfGroupId;
  titleKey: string;
  items: CatalogNote[];
};

/** Group PDFs into Books / Notes / Worksheets for the library page. */
export function groupLibraryPdfs(notes: CatalogNote[]): LibraryPdfGroup[] {
  const books: CatalogNote[] = [];
  const worksheets: CatalogNote[] = [];
  const summaries: CatalogNote[] = [];

  for (const note of notes) {
    const category = (note.category || "").toLowerCase();
    const kind = note.kind || "";
    const title = (note.title || "").toLowerCase();

    const isBook =
      category === "classbook" ||
      title.includes("كتاب") ||
      title.includes("book");
    const isWorksheet =
      category === "workbook" ||
      category === "questions" ||
      kind === "ورقة عمل" ||
      title.includes("ورقة") ||
      title.includes("worksheet");

    if (isBook) books.push(note);
    else if (isWorksheet) worksheets.push(note);
    else summaries.push(note);
  }

  const groups: LibraryPdfGroup[] = [
    { id: "books", titleKey: "libraryGroupBooks", items: books },
    { id: "notes", titleKey: "libraryGroupNotes", items: summaries },
    { id: "worksheets", titleKey: "libraryGroupWorksheets", items: worksheets },
  ];
  return groups.filter((group) => group.items.length > 0);
}
