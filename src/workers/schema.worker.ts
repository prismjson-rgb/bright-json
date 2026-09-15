import { validateJsonAgainstSchema } from "../lib/json-schema-validate";
self.onmessage = (event: MessageEvent<{ json: string; schema: string }>) => {
  self.postMessage(validateJsonAgainstSchema(event.data.json, event.data.schema));
};
