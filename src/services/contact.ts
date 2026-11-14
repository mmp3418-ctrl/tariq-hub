export type SocialChannel = {
  id: string;
  label: string;
  handle: string;
  href: string;
};

export type ContactProfile = {
  email: string;
  city: string;
  country: string;
  address: string;
  hours: string;
  socials: SocialChannel[];
};

/**
 * Public contact profile.
 * Swap `fetchContact` for a Supabase row when an admin later edits these fields.
 * Empty `href` means the channel is reserved and not yet published.
 */
const profile: ContactProfile = {
  email: "study@tariqhub.ly",
  city: "طرابلس",
  country: "ليبيا",
  address: "العنوان التفصيلي يُنشر مع بيانات التواصل.",
  hours: "الرد على الرسائل خلال أيام الدراسة",
  socials: [
    { id: "youtube", label: "يوتيوب", handle: "قناة طارق", href: "" },
    { id: "telegram", label: "تيليغرام", handle: "@tariqhub", href: "" },
    { id: "instagram", label: "إنستغرام", handle: "@tariqhub", href: "" },
  ],
};

export function listContact(): ContactProfile {
  return profile;
}

export function fetchContact(): Promise<ContactProfile> {
  return Promise.resolve(listContact());
}
