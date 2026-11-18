import { isSupabaseConfigured, supabase } from "../lib/supabase.ts";

/**
 * Public universal timetable visibility from site_timetable_status.
 * Fail-open: show the timetable unless the row exists and is_active is explicitly false.
 */
export async function fetchSiteTimetableActive(): Promise<boolean> {
  console.info("[tariq] site_timetable_status: fetch start", {
    isSupabaseConfigured,
    hasClient: Boolean(supabase),
  });

  // No Supabase / missing env → still show the public template
  if (!supabase || !isSupabaseConfigured) {
    console.warn(
      "[tariq] site_timetable_status: Supabase not configured — defaulting active=true",
    );
    return true;
  }

  try {
    const { data, error, status, statusText } = await supabase
      .from("site_timetable_status")
      .select("id, is_active")
      .eq("id", 1)
      .maybeSingle();

    console.info("[tariq] site_timetable_status: response", {
      status,
      statusText,
      data,
      error: error
        ? { message: error.message, code: error.code, details: error.details }
        : null,
    });

    // Table missing, RLS, or network — show timetable
    if (error) {
      const msg = error.message ?? "";
      const missing =
        /does not exist|schema cache|relation|Could not find the table/i.test(msg) ||
        error.code === "42P01" ||
        error.code === "PGRST205";
      console.warn(
        "[tariq] site_timetable_status: query error — defaulting active=true",
        { missing, message: msg, code: error.code },
      );
      return true;
    }

    // No row yet — show timetable
    if (data == null) {
      console.info(
        "[tariq] site_timetable_status: no row (id=1) — defaulting active=true",
      );
      return true;
    }

    const raw = (data as { is_active?: boolean | null }).is_active;
    // Only hide when explicitly false
    const active = raw !== false;
    console.info("[tariq] site_timetable_status: resolved", {
      raw,
      active,
    });
    return active;
  } catch (err) {
    console.error(
      "[tariq] site_timetable_status: exception — defaulting active=true",
      err,
    );
    return true;
  }
}
