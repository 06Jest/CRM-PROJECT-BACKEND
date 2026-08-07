export const SOURCES = [
  "Website",
  "Referral",
  "Facebook",
  "Instagram",
  "LinkedIn",
  "Google Search",
  "Google Ads",
  "Email Campaign",
  "Cold Call",
  "Trade Show",
  "Webinar",
  "Partner",
  "Walk-in",
  "WhatsApp",
  "Messenger",
  "Personal Network",
  "Direct Conversation",
  "Networking Event",
  "Conference",
  "Friend",
  "Family",
  "Other",
] as const;

export type Source = typeof SOURCES[number];

export const SUFFIXES = [
  "Jr.",
  "Sr.",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
] as const;

export type Suffix = (typeof SUFFIXES)[number] | null;

export const GENDERS = [
  "Male",
  "Female",
  "Prefer not to say",
] as const;

export type Gender = typeof GENDERS[number];

export const PRIORITIES = [
  "Highest",
  "High",
  "Low",
] as const;

export type Priority = typeof PRIORITIES[number];

export const ROLES = [
  "owner",  
  "manager",
  "agent",
] as const;

export type Roles = typeof ROLES[number];

export const PREFERRED_CONTACT_TIMES = [
  "Morning",
  "Afternoon",
  "Evening",
  "Anytime",
] as const;

export type PreferredTime = typeof PREFERRED_CONTACT_TIMES[number];

export const ONBOARDING_STEPS = {
  ACCOUNT_CREATED: 0,
  PROFILE_COMPLETED: 1,
  WORKSPACE_CREATED: 2,
  SUBSCRIPTION_CREATED: 3,
  COMPLETED: 4,
} as const;

export type OnboardingStep =
  (typeof ONBOARDING_STEPS)[keyof typeof ONBOARDING_STEPS];