import type { TutorialSection } from "./learn-content";

export const LEARN_PROGRESS_KEY = "json-prism-learn-progress-v1";
export const LEARN_PROGRESS_EVENT = "json-prism-learn-progress-change";

export function readLearnProgress(validIds: string[]): string[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(LEARN_PROGRESS_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    const allowed = new Set(validIds);
    return [...new Set(parsed.filter((id): id is string => typeof id === "string" && allowed.has(id)))];
  } catch {
    return [];
  }
}

export function toggleLearnProgress(id: string, validIds: string[]): string[] {
  const current = readLearnProgress(validIds);
  const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
  try {
    window.localStorage.setItem(LEARN_PROGRESS_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(LEARN_PROGRESS_EVENT));
  } catch {
    // A blocked storage API leaves the current page usable.
  }
  return next;
}

export function readingMinutes(section: TutorialSection): number {
  const words = section.contentMarkdown.trim().split(/\s+/).length;
  return Math.max(2, Math.round(words / 220));
}

export const ERROR_LESSON_IDS = new Set([
  "unexpected-token-in-json", "unexpected-end-of-json-input", "json-parse-error-position",
  "fix-single-quotes-json", "fix-unquoted-keys-json", "json-bom-error",
  "missing-comma-json", "fixing-trailing-commas", "common-mistakes",
  "fixing-llm-json", "clean-chatgpt-json", "repair-truncated-llm-json",
]);

export function isErrorLesson(section: TutorialSection): boolean {
  return ERROR_LESSON_IDS.has(section.id);
}
