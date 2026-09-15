"use client";

import { useEffect, useState } from "react";
import { LEARN_PROGRESS_EVENT, readLearnProgress, toggleLearnProgress } from "@/lib/learn-ui";

export function useLearnProgress(ids: string[]) {
  const [done, setDone] = useState<string[]>([]);
  useEffect(() => {
    const refresh = () => setDone(readLearnProgress(ids));
    refresh();
    window.addEventListener(LEARN_PROGRESS_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(LEARN_PROGRESS_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [ids]);
  const toggle = (id: string) => setDone(toggleLearnProgress(id, ids));
  return { done, toggle };
}

export function LearnProgressMeter({ ids }: { ids: string[] }) {
  const { done } = useLearnProgress(ids);
  return (
    <div className="learn-progress-meter" aria-label={`${done.length} of ${ids.length} lessons completed`}>
      <span className="learn-progress-track"><span style={{ width: `${ids.length ? done.length / ids.length * 100 : 0}%` }} /></span>
      <span>{done.length}/{ids.length}</span>
    </div>
  );
}

export function LearnCompletionButton({ id, ids }: { id: string; ids: string[] }) {
  const { done, toggle } = useLearnProgress(ids);
  const completed = done.includes(id);
  return <button type="button" className="learn-completion" aria-pressed={completed} onClick={() => toggle(id)}>{completed ? "✓ completed" : "mark complete"}</button>;
}
