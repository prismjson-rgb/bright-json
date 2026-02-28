"use client";
import { useState, useMemo } from "react";
import { jsonToYaml } from "@/lib/json-to-yaml";
import { jsonToXml } from "@/lib/json-to-xml";
import { jsonToCsv } from "@/lib/json-to-csv";

export type ConvertFormat = "yaml" | "xml" | "csv";

export function useJsonConvert(parsed: unknown) {
  const [format, setFormat] = useState<ConvertFormat>("yaml");

  const output = useMemo(() => {
    if (parsed === null || parsed === undefined) return "";
    if (format === "yaml") return jsonToYaml(parsed);
    if (format === "xml") return jsonToXml(parsed);
    return jsonToCsv(parsed);
  }, [parsed, format]);

  const fileExtension = format === "yaml" ? "yaml" : format === "xml" ? "xml" : "csv";
  const mimeType =
    format === "yaml"
      ? "text/yaml"
      : format === "xml"
        ? "application/xml"
        : "text/csv";

  return { format, setFormat, output, fileExtension, mimeType };
}
