import { isUuid } from "../lib/ids.ts";
import { isSupabaseConfigured, supabase } from "../lib/supabase.ts";

const STATUS_KEY = "default";

/**
 * Public universal timetable visibility from site_timetable_status.
 * Never queries uuid id = "1". Prefers status_key, else first row.
 * Fail-open: show unless explicitly is_active === false.
 */
export async function fetchSiteTimetableActive(): Promise<boolean> {
  console.info("[tariq] site_timetable_status: fetch start", {
    isSupabaseConfigured,
    hasClient: Boolean(supabase),
  });

  if (!supabase || !isSupabaseConfigured) {
    console.warn(
      "[tariq] site_timetable_status: Supabase not configured — defaulting active=true",
    );
    return true;
  }

  try {
    // 1) Prefer stable text key (never uuid "1")
    const byKey = await supabase
      .from("site_timetable_status")
      .select("id, status_key, is_active")
      .eq("status_key", STATUS_KEY)
      .maybeSingle();

    console.info("[tariq] site_timetable_status: by status_key", {
      data: byKey.data,
      error: byKey.error
        ? { message: byKey.error.message, code: byKey.error.code }
        : null,
    });

    if (!byKey.error && byKey.data) {
      const active =
        (byKey.data as { is_active?: boolean }).is_active !== false;
      console.info("[tariq] site_timetable_status: resolved via status_key", {
        active,
      });
      return active;
    }

    // 2) Legacy / missing status_key / uuid id mistakes → first row only
    const any = await supabase
      .from("site_timetable_status")
      .select("id, is_active")
      .limit(1)
      .maybeSingle();

    console.info("[tariq] site_timetable_status: fallback first row", {
      data: any.data,
      error: any.error
        ? { message: any.error.message, code: any.error.code }
        : null,
      idIsUuid: any.data?.id != null ? isUuid(String(any.data.id)) : null,
    });

    if (any.error) {
      console.warn(
        "[tariq] site_timetable_status: query error — defaulting active=true",
        any.error.message,
      );
      return true;
    }

    if (any.data == null) {
      console.info(
        "[tariq] site_timetable_status: no rows — defaulting active=true",
      );
      return true;
    }

    const active = (any.data as { is_active?: boolean }).is_active !== false;
    console.info("[tariq] site_timetable_status: resolved via first row", {
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
