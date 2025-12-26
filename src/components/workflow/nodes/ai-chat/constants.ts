export const AI_MODELS = [
  "gpt-4o-mini",
  "gpt-4o",
  "gpt-3.5-turbo",
  "claude-3",
] as const;

export type AIModel = (typeof AI_MODELS)[number];

export const HANDLE_STYLE = "!w-3 !h-3 !bg-emerald-400 !border-2 !border-emerald-600 hover:!scale-125 transition-transform";
