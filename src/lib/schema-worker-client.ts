import type { ValidationResult } from "./schema-result";
import { assertInputBudget } from "./input-limits";

export function validateSchemaAsync(json: string, schema: string, signal: AbortSignal): Promise<ValidationResult> {
  return new Promise((resolve) => {
    let worker: Worker | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const finish = (result: ValidationResult) => {
      clearTimeout(timer); worker?.terminate(); signal.removeEventListener("abort", cancel); resolve(result);
    };
    const fail = (message: string) => finish({ status: "schema-error", errors: [], schemaErrorMsg: message });
    const cancel = () => fail("Validation cancelled.");
    try {
      assertInputBudget(json); assertInputBudget(schema);
      if (schema.length > 100_000) throw new Error("Schema exceeds the 100,000 character limit.");
      if (signal.aborted) { cancel(); return; }
      worker = new Worker(new URL("../workers/schema.worker.ts", import.meta.url), { type: "module" });
      signal.addEventListener("abort", cancel, { once: true });
      timer = setTimeout(() => fail("Validation exceeded 2 seconds. Simplify the schema or validate a smaller document."), 2000);
      worker.onmessage = (event: MessageEvent<ValidationResult>) => finish(event.data);
      worker.onerror = () => fail("Schema worker unavailable. Validation requires browser workers.");
      worker.postMessage({ json, schema });
    } catch (error) { fail(error instanceof Error ? error.message : "Cannot start validation worker."); }
  });
}
