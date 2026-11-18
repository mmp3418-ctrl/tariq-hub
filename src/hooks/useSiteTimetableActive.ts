import { useCallback, useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabase.ts";
import { fetchSiteTimetableActive } from "../services/siteTimetable.ts";

export function useSiteTimetableActive() {
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const next = await fetchSiteTimetableActive();
      console.info("[tariq] useSiteTimetableActive: applying", { active: next });
      setActive(next);
    } catch (err) {
      console.error(
        "[tariq] useSiteTimetableActive: exception — keeping active=true",
        err,
      );
      setActive(true);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const client = supabase;
    if (!client || !isSupabaseConfigured) return;
    const channel = client
      .channel(`tariq-timetable-hook-${Date.now()}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_timetable_status" },
        () => void refresh(),
      )
      .subscribe();
    return () => {
      void client.removeChannel(channel);
    };
  }, [refresh]);

  return { ready, active, refresh };
}
