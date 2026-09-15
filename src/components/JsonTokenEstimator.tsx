"use client";
import { useState, useMemo } from "react";
import { Hash } from "lucide-react";
import { estimateTokens, estimateCost } from "@/lib/token-estimate";
import { jsonToYaml } from "@/lib/json-to-yaml";
import { jsonToXml } from "@/lib/json-to-xml";
import { InfoHelp } from "@/components/app/InfoHelp";
import { MODES } from "@/lib/modes";

export default function JsonTokenEstimator({ json, parsed }: { json: string; parsed: unknown }) {
  const [inputRate, setInputRate] = useState("");
  const [outputRate, setOutputRate] = useState("");
  const validRate = (rate: string) => rate.trim() !== "" && Number.isFinite(Number(rate)) && Number(rate) >= 0;
  const model = useMemo(() => ({ name: "Custom rates", inputPricePer1M: Number(inputRate), outputPricePer1M: Number(outputRate) }), [inputRate, outputRate]);

  const jsonTokens = useMemo(() => estimateTokens(json), [json]);
  const yamlStr = useMemo(() => { try { return jsonToYaml(parsed); } catch { return ""; } }, [parsed]);
  const xmlStr = useMemo(() => { try { return jsonToXml(parsed); } catch { return ""; } }, [parsed]);
  const yamlTokens = useMemo(() => estimateTokens(yamlStr), [yamlStr]);
  const xmlTokens = useMemo(() => estimateTokens(xmlStr), [xmlStr]);
  const cost = useMemo(() => estimateCost(jsonTokens, model), [jsonTokens, model]);

  const yamlSavings = jsonTokens > 0 ? Math.round((1 - yamlTokens / jsonTokens) * 100) : 0;
  const xmlExtra = jsonTokens > 0 ? Math.round((xmlTokens / jsonTokens - 1) * 100) : 0;

  const tips: string[] = [];
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    const keys = Object.keys(parsed as object);
    if (keys.some(k => k.length > 15)) tips.push("Shorten long key names to reduce token count");
    const depth = JSON.stringify(parsed).split("{").length - 1;
    if (depth > 4) tips.push("Consider flattening nested structures to reduce tokens");
  }
  if (jsonTokens > 10000) tips.push("Large payload — consider sending only the fields you need");
  if (parsed && Array.isArray(parsed) && (parsed as unknown[]).length > 50) tips.push("Paginate large arrays — send only what's needed per request");

  return (
    <div className="flex flex-col h-full">
      <div className="pane-header">
        <Hash className="w-3.5 h-3.5" />
        <span>Token Estimator</span>
        <InfoHelp text={MODES.tokens.help} label="About Token Estimator" side="bottom" />
      </div>
      {!json.trim() ? (
        <div className="flex items-center justify-center flex-1 text-muted-foreground text-sm">
          <div className="text-center"><Hash className="w-8 h-8 opacity-30 mx-auto mb-2" /><p>No JSON loaded</p></div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Token count */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
            <div className="text-4xl font-bold text-primary font-mono">{jsonTokens.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">estimated tokens (JSON)</div>
          </div>

          {/* Model selector */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Enter current provider rates in USD per million tokens. No bundled model prices; excludes caching, batch discounts and taxes.</p>
            <label className="text-xs block">Input rate<input type="number" min="0" step="any" value={inputRate} onChange={e => setInputRate(e.target.value)} className="w-full bg-secondary p-2 rounded" /></label>
            <label className="text-xs block mt-2">Output rate<input type="number" min="0" step="any" value={outputRate} onChange={e => setOutputRate(e.target.value)} className="w-full bg-secondary p-2 rounded" /></label>
          </div>

          {/* Cost */}
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Cost for {jsonTokens.toLocaleString()} tokens</label>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-secondary/50 rounded-lg p-3">
                <div className="text-[10px] text-muted-foreground mb-1">As input</div>
                <div className="text-sm font-semibold font-mono text-foreground">{validRate(inputRate) ? cost.input : "Enter a rate"}</div>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3">
                <div className="text-[10px] text-muted-foreground mb-1">As output</div>
                <div className="text-sm font-semibold font-mono text-foreground">{validRate(outputRate) ? cost.output : "Enter a rate"}</div>
              </div>
            </div>
          </div>

          {/* Format comparison */}
          {!!parsed && (
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Format Comparison</label>
              <div className="space-y-2">
                {[
                  { label: "JSON", tokens: jsonTokens, note: "current" },
                  { label: "YAML", tokens: yamlTokens, note: yamlSavings > 0 ? `saves ${yamlSavings}% tokens` : `+${Math.abs(yamlSavings)}% tokens` },
                  { label: "XML", tokens: xmlTokens, note: xmlExtra > 0 ? `+${xmlExtra}% tokens` : `saves ${Math.abs(xmlExtra)}%` },
                ].map(f => (
                  <div key={f.label} className="flex items-center gap-3">
                    <span className="text-xs font-mono w-10 text-foreground">{f.label}</span>
                    <div className="flex-1 bg-secondary rounded-full h-2 overflow-hidden">
                      <div className="h-full bg-primary/60 rounded-full" style={{ width: `${Math.min(100, (f.tokens / Math.max(jsonTokens, yamlTokens, xmlTokens)) * 100)}%` }} />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground w-16 text-right">{f.tokens.toLocaleString()}</span>
                    <span className={`text-[10px] w-28 ${f.label === "JSON" ? "text-muted-foreground" : f.label === "YAML" && yamlSavings > 0 ? "text-emerald-500" : "text-yellow-500"}`}>{f.note}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Optimization tips */}
          {tips.length > 0 && (
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Optimization Tips</label>
              <div className="space-y-2">
                {tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="text-primary shrink-0">&rarr;</span> {tip}
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-[10px] text-muted-foreground/50">* Token estimates are approximate (&asymp;4 chars/token). Actual counts depend on the tokenizer.</p>
        </div>
      )}
    </div>
  );
}
