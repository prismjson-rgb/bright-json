export const DEPLOYMENT_AWAY_THRESHOLD = 30 * 60 * 1000;

/** Compare against the running bundle, never against the first network response. */
export function startDeploymentMonitor(currentSha: string | undefined, onUpdate: (available: boolean) => void) {
  if (!currentSha || currentSha === "local") return () => {};
  let stopped = false;
  let pending: AbortController | null = null;
  let hiddenSince: number | null = document.visibilityState === "hidden" ? Date.now() : null;
  const check = async () => {
    if (stopped || pending) return;
    const controller = new AbortController();
    pending = controller;
    const timeout = setTimeout(() => controller.abort(), 10_000);
    try {
      const response = await fetch("/deployment.json", { cache: "no-store", signal: controller.signal });
      if (!response.ok) return;
      const marker: unknown = await response.json();
      if (!stopped && marker && typeof marker === "object" && "environment" in marker && marker.environment === "production" && "sha" in marker && typeof marker.sha === "string" && /^[a-f0-9]{40}$/i.test(marker.sha)) {
        onUpdate(marker.sha !== currentSha);
      }
    } catch {
      // Offline and transient deployment failures must never interrupt editing.
    } finally {
      clearTimeout(timeout);
      pending = null;
    }
  };
  const onVisibility = () => {
    if (document.visibilityState === "hidden") {
      hiddenSince ??= Date.now();
      return;
    }
    const awaySince = hiddenSince;
    hiddenSince = null;
    if (awaySince !== null && Date.now() - awaySince >= DEPLOYMENT_AWAY_THRESHOLD) void check();
  };
  document.addEventListener("visibilitychange", onVisibility);
  return () => {
    stopped = true;
    pending?.abort();
    document.removeEventListener("visibilitychange", onVisibility);
  };
}
