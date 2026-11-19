import { isSupabaseConfigured, supabase } from "../lib/supabase.ts";

const GRADE_CALCULATOR_KEY = "grade_calculator";

/**
 * Resolve whether the Grade Calculator tool is active.
 * Prefers `site_tool_settings`, falls back to legacy `teacher_space_settings`.
 * Fail-open (`true`) on missing rows / query errors so the rest of the hub keeps rendering.
 */
export async function fetchGradeCalculatorActive(): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) {
    return true;
  }

  try {
    const toolRes = await supabase
      .from("site_tool_settings")
      .select("is_active")
      .eq("tool_key", GRADE_CALCULATOR_KEY)
      .maybeSingle();

    if (!toolRes.error && toolRes.data != null) {
      return (toolRes.data as { is_active?: boolean | null }).is_active !== false;
    }

    if (toolRes.error) {
      console.warn(
        "[tariq] site_tool_settings grade_calculator:",
        toolRes.error.message,
      );
    }
  } catch (err) {
    console.warn("[tariq] site_tool_settings grade_calculator exception:", err);
  }

  try {
    const legacy = await supabase
      .from("teacher_space_settings")
      .select("grade_calculator_active")
      .eq("id", 1)
      .maybeSingle();

    if (!legacy.error && legacy.data != null) {
      return (
        (legacy.data as { grade_calculator_active?: boolean | null })
          .grade_calculator_active !== false
      );
    }

    if (legacy.error) {
      console.warn(
        "[tariq] teacher_space_settings grade_calculator:",
        legacy.error.message,
      );
    }
  } catch (err) {
    console.warn(
      "[tariq] teacher_space_settings grade_calculator exception:",
      err,
    );
  }

  return true;
}
