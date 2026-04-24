/**
 * Safely serializes an object to JSON for use in <script type="application/ld+json">.
 * JSON.stringify does not escape </script>, which allows HTML injection.
 * This replaces </ with <\/ to prevent premature script tag closing.
 */
export function safeJsonLd(obj: unknown): string {
  return JSON.stringify(obj).replace(/<\//g, "<\\/");
}
