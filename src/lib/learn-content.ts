/**
 * Learn content — uses generated sections (no Node fs at runtime).
 * Run `npm run generate:content` to regenerate from content/learn/*.md
 */

import {
  LEARN_SECTIONS,
  type LearnSection,
} from "./learn-sections.generated";

export { LEARN_LEVELS } from "./learn-sections.generated";

export type Level =
  | "beginner"
  | "comfortable"
  | "practical"
  | "intermediate"
  | "advanced"
  | "expert";

export type TutorialSection = LearnSection;

export function getTutorialSections(): TutorialSection[] {
  return LEARN_SECTIONS;
}

export function getSectionById(id: string): TutorialSection | undefined {
  return LEARN_SECTIONS.find((s) => s.id === id);
}

export function getSectionsByLevel(level: Level): TutorialSection[] {
  return LEARN_SECTIONS.filter((s) => s.level === level);
}
