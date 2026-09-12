"use client";
import { useState, useMemo } from "react";
import { jsonToYaml } from "@/lib/json-to-yaml";
import { jsonToXml } from "@/lib/json-to-xml";
import { jsonToCsv } from "@/lib/json-to-csv";
import { jsonToToon } from "@/lib/json-to-toon";
import { jsonToString } from "@/lib/json-to-string";

export type ConvertFormat = "yaml" | "toon" | "xml" | "csv" | "string";

export function useJsonConvert(parsed: unknown, initialFormat: ConvertFormat = "yaml") {
  const [format, setFormat] = useState<ConvertFormat>(initialFormat);

  const output = useMemo(() => {
    if (parsed === null || parsed === undefined) return "";
    if (format === "yaml") return jsonToYaml(parsed);
    if (format === "toon") return jsonToToon(parsed);
    if (format === "xml") return jsonToXml(parsed);
    if (format === "string") return jsonToString(parsed);
    return jsonToCsv(parsed);
  }, [parsed, format]);

  const fileExtension =
    format === "yaml" ? "yaml" : format === "toon" ? "toon" : format === "xml" ? "xml" : format === "string" ? "txt" : "csv";
  const mimeType =
    format === "yaml"
      ? "text/yaml"
      : format === "toon"
        ? "text/toon"
        : format === "xml"
          ? "application/xml"
          : format === "string"
            ? "text/plain"
            : "text/csv";

  return { format, setFormat, output, fileExtension, mimeType };
}
