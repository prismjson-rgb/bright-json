import { useCallback, useEffect, useRef, useState } from "react";

interface UseJsonParserResult {
  json: string;
  setJson: (value: string) => void;
  parsed: unknown | null;
  error: string | null;
  format: () => void;
  minify: () => void;
  sortKeys: () => void;
}

function sortObjectKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(sortObjectKeys);
  if (obj !== null && typeof obj === "object") {
    return Object.keys(obj as Record<string, unknown>)
      .sort()
      .reduce((acc, key) => {
        acc[key] = sortObjectKeys((obj as Record<string, unknown>)[key]);
        return acc;
      }, {} as Record<string, unknown>);
  }
  return obj;
}

export function useJsonParser(initialValue = ""): UseJsonParserResult {
  const [json, setJsonRaw] = useState(initialValue);
  const [parsed, setParsed] = useState<unknown | null>(null);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const validate = useCallback((value: string) => {
    if (!value.trim()) {
      setParsed(null);
      setError(null);
      return;
    }
    try {
      const result = JSON.parse(value);
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

  const format = useCallback(() => {
    try {
      const obj = JSON.parse(json);
      const formatted = JSON.stringify(obj, null, 2);
      setJsonRaw(formatted);
      setParsed(obj);
      setError(null);
    } catch {}
  }, [json]);

  const minify = useCallback(() => {
    try {
      const obj = JSON.parse(json);
      const minified = JSON.stringify(obj);
      setJsonRaw(minified);
      setParsed(obj);
      setError(null);
    } catch {}
  }, [json]);

  const sortKeys = useCallback(() => {
    try {
      const obj = JSON.parse(json);
      const sorted = sortObjectKeys(obj);
      const formatted = JSON.stringify(sorted, null, 2);
      setJsonRaw(formatted);
      setParsed(sorted);
      setError(null);
    } catch {}
  }, [json]);

  return { json, setJson, parsed, error, format, minify, sortKeys };
}
