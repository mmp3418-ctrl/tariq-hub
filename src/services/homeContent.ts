import { isSupabaseConfigured, supabase } from "../lib/supabase.ts";
import {
  normalizeAppHref,
  normalizeExternalHref,
  normalizeMediaHref,
} from "../lib/contactLinks.ts";

/** Live public.home_content row (id = 1). */
export type DbHomeContent = {
  id: number;
  hero_title?: string | null;
  hero_subtitle?: string | null;
  hero_cta_text?: string | null;
  hero_cta_url?: string | null;
  about_text?: string | null;
  updated_at?: string | null;
};

/** Live public.books row. */
export type DbBook = {
  id: string;
  title?: string | null;
  description?: string | null;
  cover_image?: string | null;
  download_url?: string | null;
  price?: string | null;
  is_active?: boolean | null;
  sort_order?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type HomeBook = {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  downloadUrl: string;
  price: string;
};

export type HomePageContent = {
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  heroCtaUrl: string;
  aboutText: string;
  books: HomeBook[];
  ready: boolean;
  source: "mock" | "supabase";
};

function text(value: string | null | undefined) {
  return (value ?? "").trim();
}

function mapBook(row: DbBook): HomeBook | null {
  try {
    const title = text(row.title);
    if (!title) return null;
    return {
      id: String(row.id ?? `book-${title}`),
      title,
      description: text(row.description),
      coverImage: normalizeMediaHref(text(row.cover_image)),
      downloadUrl:
        normalizeExternalHref(text(row.download_url)) ||
        normalizeMediaHref(text(row.download_url)),
      price: text(row.price),
    };
  } catch (err) {
    console.error("[tariq] mapBook:", err);
    return null;
  }
}

/**
 * Live uncached home_content (id = 1).
 * Uses the shared Supabase client (`cache: 'no-store'` via supabaseLiveFetch).
 */
export async function fetchHomeContent(): Promise<DbHomeContent | null> {
  if (!supabase || !isSupabaseConfigured) return null;

  try {
    const { data, error } = await supabase
      .from("home_content")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (error) {
      console.error("[tariq] home_content id=1:", error.message, error);
      return null;
    }
    if (!data) {
      console.warn("[tariq] home_content: no row with id=1");
      return null;
    }
    return data as DbHomeContent;
  } catch (err) {
    console.error("[tariq] fetchHomeContent exception:", err);
    return null;
  }
}

/** Active books only — ordered, uncached. */
export async function fetchActiveBooks(): Promise<DbBook[] | null> {
  if (!supabase || !isSupabaseConfigured) return null;

  try {
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[tariq] books active:", error.message, error);
      return null;
    }
    return ((data as DbBook[] | null) ?? []).filter((row) => row.is_active !== false);
  } catch (err) {
    console.error("[tariq] fetchActiveBooks exception:", err);
    return null;
  }
}

export async function fetchHomePageBundle(): Promise<{
  content: DbHomeContent | null;
  books: DbBook[];
  source: "mock" | "supabase";
}> {
  if (!isSupabaseConfigured || !supabase) {
    return { content: null, books: [], source: "mock" };
  }

  try {
    const [content, books] = await Promise.all([fetchHomeContent(), fetchActiveBooks()]);
    const activeBooks = books ?? [];
    return {
      content,
      books: activeBooks,
      source: content || activeBooks.length > 0 ? "supabase" : "mock",
    };
  } catch (err) {
    console.error("[tariq] fetchHomePageBundle exception:", err);
    return { content: null, books: [], source: "mock" };
  }
}

export function mapHomePageContent(
  content: DbHomeContent | null | undefined,
  books: DbBook[] | null | undefined,
  source: "mock" | "supabase",
  ready: boolean,
): HomePageContent {
  const mappedBooks = (Array.isArray(books) ? books : [])
    .map(mapBook)
    .filter((book): book is HomeBook => Boolean(book));

  return {
    heroTitle: text(content?.hero_title),
    heroSubtitle: text(content?.hero_subtitle),
    heroCtaText: text(content?.hero_cta_text),
    heroCtaUrl: normalizeAppHref(text(content?.hero_cta_url)),
    aboutText: text(content?.about_text),
    books: mappedBooks,
    ready,
    source,
  };
}
