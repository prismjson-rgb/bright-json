"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { ShieldCheck, ShieldX, AlertTriangle, FileJson, ChevronRight } from "lucide-react";
import type { ErrorObject } from "ajv";
import { validateJsonAgainstSchema, errorPath, type ValidationResult } from "@/lib/json-schema-validate";
import { InfoHelp } from "@/components/app/InfoHelp";
import { MODES } from "@/lib/modes";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const SAMPLE_SCHEMA = `{
  "type": "object",
  "required": ["id", "name"],
  "properties": {
    "id":     { "type": "string" },
    "name":   { "type": "string", "minLength": 1 },
    "age":    { "type": "number", "minimum": 0 },
    "email":  { "type": "string" },
    "active": { "type": "boolean" }
  },
  "additionalProperties": true
}`;

export default function JsonSchemaValidator({ json, dark }: { json: string; dark: boolean }) {
  const [schemaText, setSchemaText] = useState("");
  const [validation, setValidation] = useState<ValidationResult>({ status: "idle", errors: [] });

  useEffect(() => {
    setValidation(validateJsonAgainstSchema(json, schemaText));
  }, [json, schemaText]);

  const { status, errors, schemaErrorMsg } = validation;

  return (
    <div className="flex flex-col h-full">
      <div className="pane-header">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Schema Validator</span>
        {status === "valid" && (
          <span className="ml-auto flex items-center gap-1 text-[10px] font-medium text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            <ShieldCheck className="w-3 h-3" /> Valid
          </span>
        )}
        {status === "invalid" && (
          <span className="ml-auto flex items-center gap-1 text-[10px] font-medium text-destructive bg-destructive/10 border border-destructive/20 px-2 py-0.5 rounded-full">
            <ShieldX className="w-3 h-3" /> {errors.length} error{errors.length !== 1 ? "s" : ""}
          </span>
        )}
        {(status === "schema-error" || status === "json-error") && (
          <span className="ml-auto flex items-center gap-1 text-[10px] font-medium text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
            <AlertTriangle className="w-3 h-3" /> {status === "json-error" ? "Invalid JSON" : "Bad schema"}
          </span>
        )}
        <InfoHelp text={MODES.schema.help} label="About Schema Validator" side="bottom" />
      </div>

      {/* Schema editor */}
      <div className="flex flex-col border-b border-border" style={{ height: "42%" }}>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[hsl(var(--pane-header))] border-b border-border">
          <FileJson className="w-3 h-3 text-muted-foreground" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex-1">JSON Schema (Draft 7)</span>
          {!schemaText.trim() && (
            <button
              onClick={() => setSchemaText(SAMPLE_SCHEMA)}
              className="text-[10px] text-primary hover:underline"
            >
              Load sample
            </button>
          )}
          {schemaText.trim() && (
            <button
              onClick={() => setSchemaText("")}
              className="text-[10px] text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex-1 min-h-0">
          {schemaText.trim() ? (
            <MonacoEditor
              height="100%"
              language="json"
              theme={dark ? "vs-dark" : "vs"}
              value={schemaText}
              onChange={(v) => setSchemaText(v ?? "")}
              options={{
                minimap: { enabled: false },
                fontSize: 12,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 8 },
                lineNumbers: "off",
                folding: false,
              }}
            />
          ) : (
            <div
              className="h-full flex flex-col items-center justify-center gap-2 text-muted-foreground cursor-pointer hover:bg-secondary/20 transition-colors p-4"
              onClick={() => setSchemaText(SAMPLE_SCHEMA)}
            >
              <FileJson className="w-6 h-6 opacity-30" />
              <p className="text-xs text-center">Paste your JSON Schema here,<br />or click to load a sample</p>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[hsl(var(--pane-header))] border-b border-border sticky top-0">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Results</span>
        </div>

        <div className="flex-1 p-3">
          {status === "idle" && (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
              <ShieldCheck className="w-7 h-7 opacity-25" />
              <p className="text-xs text-center">Paste a schema above to start<br />validating the current JSON</p>
            </div>
          )}

          {status === "json-error" && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-500/8 border border-amber-500/20 p-3 text-xs text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              The JSON in the editor is not valid — fix it before validating against a schema.
            </div>
          )}

          {status === "schema-error" && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-500/8 border border-amber-500/20 p-3 text-xs text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <div>
                <div className="font-medium mb-0.5">Invalid schema</div>
                <div className="opacity-80 font-mono">{schemaErrorMsg}</div>
              </div>
            </div>
          )}

          {status === "valid" && (
            <div className="flex items-center gap-2.5 rounded-lg bg-emerald-500/8 border border-emerald-500/20 p-3 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              JSON is valid against the schema
            </div>
          )}

          {status === "invalid" && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 rounded-lg bg-destructive/8 border border-destructive/20 p-2.5 text-xs text-destructive font-medium">
                <ShieldX className="w-3.5 h-3.5 shrink-0" />
                {errors.length} validation error{errors.length !== 1 ? "s" : ""} found
              </div>
              <div className="flex flex-col gap-1.5 mt-1">
                {errors.map((e, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-xs">
                    <ChevronRight className="w-3 h-3 text-destructive shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <div className="font-mono text-primary font-medium truncate">{errorPath(e)}</div>
                      <div className="text-muted-foreground mt-0.5">{e.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
