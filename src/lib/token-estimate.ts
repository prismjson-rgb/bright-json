export function estimateTokens(text: string): number {
  // Deliberately approximate character heuristic, not a model tokenizer.
  return Math.max(0, Math.ceil(text.length / 3.8));
}

export interface ModelInfo {
  name: string;
  inputPricePer1M: number;  // USD per 1M input tokens
  outputPricePer1M: number; // USD per 1M output tokens
}


export function estimateCost(tokens: number, model: ModelInfo): { input: string; output: string } {
  const input = (tokens / 1_000_000) * model.inputPricePer1M;
  const output = (tokens / 1_000_000) * model.outputPricePer1M;
  const fmt = (n: number) => n < 0.001 ? `< $0.001` : `$${n.toFixed(4)}`;
  return { input: fmt(input), output: fmt(output) };
}
