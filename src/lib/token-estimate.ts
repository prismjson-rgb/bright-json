export function estimateTokens(text: string): number {
  // Approximation based on cl100k (OpenAI) tokenizer
  // JSON has ~3.8 chars per token on average
  return Math.max(1, Math.ceil(text.length / 3.8));
}

export interface ModelInfo {
  name: string;
  inputPricePer1M: number;  // USD per 1M input tokens
  outputPricePer1M: number; // USD per 1M output tokens
}

export const MODELS: ModelInfo[] = [
  { name: "GPT-4o", inputPricePer1M: 2.5, outputPricePer1M: 10 },
  { name: "GPT-4o mini", inputPricePer1M: 0.15, outputPricePer1M: 0.6 },
  { name: "GPT-4", inputPricePer1M: 30, outputPricePer1M: 60 },
  { name: "Claude 3.5 Sonnet", inputPricePer1M: 3, outputPricePer1M: 15 },
  { name: "Claude 3.5 Haiku", inputPricePer1M: 0.8, outputPricePer1M: 4 },
  { name: "Claude 3 Opus", inputPricePer1M: 15, outputPricePer1M: 75 },
  { name: "Gemini 1.5 Pro", inputPricePer1M: 1.25, outputPricePer1M: 5 },
  { name: "Gemini 2.0 Flash", inputPricePer1M: 0.1, outputPricePer1M: 0.4 },
];

export function estimateCost(tokens: number, model: ModelInfo): { input: string; output: string } {
  const input = (tokens / 1_000_000) * model.inputPricePer1M;
  const output = (tokens / 1_000_000) * model.outputPricePer1M;
  const fmt = (n: number) => n < 0.001 ? `< $0.001` : `$${n.toFixed(4)}`;
  return { input: fmt(input), output: fmt(output) };
}
