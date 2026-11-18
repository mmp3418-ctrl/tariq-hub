import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  fetchHomePageBundle,
  mapHomePageContent,
  type DbBook,
  type DbHomeContent,
  type HomePageContent,
} from "../homeContent.ts";
import { isSupabaseConfigured, supabase } from "../../lib/supabase.ts";

const EMPTY: HomePageContent = mapHomePageContent(null, [], "mock", false);

/**
 * Live homepage copy + active books. Refreshes on focus/visibility and via Realtime.
 * Failed polls keep the last successful payload so the UI never blanks out.
 */
export function useHomePageContent(): HomePageContent {
  const [content, setContent] = useState<DbHomeContent | null>(null);
  const [books, setBooks] = useState<DbBook[]>([]);
  const [source, setSource] = useState<"mock" | "supabase">("mock");
  const [ready, setReady] = useState(false);
  const hasLive = useRef(false);

  const hydrate = useCallback(async () => {
    try {
      const bundle = await fetchHomePageBundle();
      if (bundle.content || bundle.books.length > 0 || bundle.source === "supabase") {
        if (bundle.content) setContent(bundle.content);
        setBooks(bundle.books);
        setSource(bundle.source);
        if (bundle.content || bundle.books.length > 0) hasLive.current = true;
      } else if (!hasLive.current) {
        setContent(null);
        setBooks([]);
        setSource("mock");
      }
    } catch (err) {
      console.error("[tariq] useHomePageContent hydrate:", err);
      if (!hasLive.current) {
        setContent(null);
        setBooks([]);
        setSource("mock");
      }
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    const onFocus = () => void hydrate();
    const onVisible = () => {
      if (document.visibilityState === "visible") void hydrate();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [hydrate]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") void hydrate();
    }, 15_000);
    return () => window.clearInterval(id);
  }, [hydrate]);

  useEffect(() => {
    const client = supabase;
    if (!client) return;

    const refresh = () => void hydrate();
    const channel = client
      .channel(`tariq-home-${Date.now()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "home_content" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "books" }, refresh)
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [hydrate]);

  return useMemo(
    () => mapHomePageContent(content, books, source, ready) ?? EMPTY,
    [books, content, ready, source],
  );
}
