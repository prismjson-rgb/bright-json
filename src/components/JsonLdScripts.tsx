import { safeJsonLd } from "@/lib/json-ld";

export function JsonLdScripts({ data }: { data: Array<unknown | null | undefined> }) {
  const scripts = data.filter((item): item is unknown => Boolean(item));

  return (
    <>
      {scripts.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(item) }}
        />
      ))}
    </>
  );
}
