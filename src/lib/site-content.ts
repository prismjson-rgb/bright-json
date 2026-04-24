import {
  HOME_CONTENT,
  TOOLS_INDEX_CONTENT,
  LEARN_INDEX_CONTENT,
  type HomeContent,
  type IndexPageContent,
} from "./site-content.generated";

export type { HomeContent, IndexPageContent };

export function getHomeContent(): HomeContent {
  return HOME_CONTENT;
}

export function getToolsIndexContent(): IndexPageContent {
  return TOOLS_INDEX_CONTENT;
}

export function getLearnIndexContent(): IndexPageContent {
  return LEARN_INDEX_CONTENT;
}
