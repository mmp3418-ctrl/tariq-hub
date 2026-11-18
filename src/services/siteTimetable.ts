import { isSupabaseConfigured, supabase } from "../lib/supabase.ts";

/**
 * Public universal timetable visibility from site_timetable_status.
 * Defaults to true when the row is missing (fail-open for first deploy).
 */
export async function fetchSiteTimetableActive(): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;

  try {
    const { data, error } = await supabase
      .from("site_timetable_status")
      .select("is_active")
      .eq("id", 1)
      .maybeSingle();

    if (error) {
      console.error("[tariq] site_timetable_status:", error.message);
      // Soft-fail: show timetable if table/policy not ready yet
      return true;
    }

    if (data == null) return true;
    return (data as { is_active?: boolean }).is_active !== false;
  } catch (err) {
    console.error("[tariq] site_timetable_status exception:", err);
    return true;
  }
}
