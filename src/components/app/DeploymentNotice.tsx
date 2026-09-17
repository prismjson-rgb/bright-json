"use client";

import { useEffect, useState } from "react";
import { startDeploymentMonitor } from "@/lib/deployment-monitor";

export default function DeploymentNotice({ onRefresh }: { onRefresh: () => Promise<void> }) {
  const [available, setAvailable] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => startDeploymentMonitor(process.env.NEXT_PUBLIC_DEPLOYMENT_SHA, setAvailable), []);
  if (!available) return null;

  const refresh = async () => {
    setSaving(true);
    setError("");
    try {
      await onRefresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save. Export your work before refreshing.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="shrink-0 border-b border-primary/30 bg-primary/10 px-3 py-2 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p role="status">A new version is available. Save your workspace and refresh when ready.</p>
        <button type="button" disabled={saving} onClick={() => void refresh()} className="rounded-md bg-primary px-3 py-1.5 font-medium text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50">
          {saving ? "Saving…" : "Save & refresh"}
        </button>
      </div>
      {error && <p role="alert" className="mt-2 text-destructive">{error}</p>}
    </div>
  );
}
