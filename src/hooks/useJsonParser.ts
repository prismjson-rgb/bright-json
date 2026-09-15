import { useCallback, useEffect, useRef, useState } from "react";
import { parseJsonSafe, formatJsonPrecisely } from "@/lib/precise-json";

export interface FormatOptions {
  indent?: number;
  sortKeys?: boolean;
}

interface UseJsonParserResult {
  json: string;
  setJson: (value: string) => void;
  parsed: unknown | null;
  error: string | null;
  format: (options?: FormatOptions) => void;
  minify: () => void;
  sortKeys: () => void;
}

export function sortObjectKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(sortObjectKeys);
  if (obj !== null && typeof obj === "object") {
    return Object.keys(obj as Record<string, unknown>)
      .sort()
      .reduce((acc, key) => {
        acc[key] = sortObjectKeys((obj as Record<string, unknown>)[key]);
        return acc;
      }, Object.create(null) as Record<string, unknown>);
  }
  return obj;
}

export function useJsonParser(initialValue = "", onTransform?: (value: string) => void): UseJsonParserResult {
  const [json, setJsonRaw] = useState(initialValue);
  const [parsed, setParsed] = useState<unknown | null>(null);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const onTransformRef = useRef(onTransform);
  useEffect(() => { onTransformRef.current = onTransform; });

  const validate = useCallback((value: string) => {
    if (!value.trim()) {
      setParsed(null);
      setError(null);
      return;
    }
    try {
      const result = parseJsonSafe(value);
      setParsed(result);
      setError(null);
    } catch (e: unknown) {
      setParsed(null);
      setError(e instanceof Error ? e.message : "Invalid JSON");
    }
  }, []);

  const setJson = useCallback(
    (value: string) => {
      setJsonRaw(value);
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => validate(value), 150);
    },
    [validate]
  );

  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  const format = useCallback((options?: FormatOptions) => {
    try {
      const indent = options?.indent ?? 2;
      const sort = options?.sortKeys ?? false;
      const formatted = formatJsonPrecisely(json, indent, sort);
      setJsonRaw(formatted);
      validate(formatted);
      onTransformRef.current?.(formatted);
    } catch (e) { setError(e instanceof Error ? e.message : "Cannot format JSON"); }
  }, [json, validate]);

  const minify = useCallback(() => {
    try {
      const minified = formatJsonPrecisely(json, 0);
      setJsonRaw(minified);
      validate(minified);
      onTransformRef.current?.(minified);
    } catch (e) { setError(e instanceof Error ? e.message : "Cannot minify JSON"); }
  }, [json, validate]);

  const sortKeys = useCallback(() => {
    try {
      const formatted = formatJsonPrecisely(json, 2, true);
      setJsonRaw(formatted);
      validate(formatted);
      onTransformRef.current?.(formatted);
    } catch (e) { setError(e instanceof Error ? e.message : "Cannot sort JSON"); }
  }, [json, validate]);

  return { json, setJson, parsed, error, format, minify, sortKeys };
}
