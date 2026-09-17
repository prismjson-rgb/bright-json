import { saveTabs, type TabsState } from "./tabs-storage";

export async function refreshWorkspace(getCurrent: () => TabsState, onSaved: (snapshot: TabsState) => void) {
  const snapshot = getCurrent();
  await saveTabs(snapshot);
  onSaved(snapshot);
  if (getCurrent() !== snapshot) throw new Error("Your workspace changed while saving. Click Save & refresh again when ready.");
  // Shared links must not re-import their original payload over the saved edits.
  if (/^#(?:json|curl|curlcmd|open-bundle)=/.test(window.location.hash)) {
    window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
  }
  window.location.reload();
}
