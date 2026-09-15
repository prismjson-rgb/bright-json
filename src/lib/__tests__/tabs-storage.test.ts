import { afterEach, describe, expect, it, vi } from "vitest";
const db = vi.hoisted(() => ({ get: vi.fn(), set: vi.fn() }));
vi.mock('../json-prism-idb', () => ({ idbGet: db.get, idbSet: db.set }));
import { loadTabs, saveTabs } from '../tabs-storage';
afterEach(() => { vi.resetAllMocks(); vi.unstubAllGlobals(); });
describe('tab and notes persistence', () => {
  it('saves document and both history stacks together and restores separate tab histories', async () => {
    vi.stubGlobal('window', {});
    vi.stubGlobal('localStorage', { removeItem: vi.fn() });
    const state = { activeId: 'a', tabs: [
      { id: 'a', name: 'A', json: '{"x":1}', history: { past: ['broken JSON'], future: ['{"x":2}'], typingAt: 50 } },
      { id: 'b', name: 'B', json: '[]', history: { past: ['null'], future: [], typingAt: null } },
    ] };
    db.set.mockImplementation(async (_key, value) => db.get.mockResolvedValue(structuredClone(value)));
    await saveTabs(state);
    const restored = await loadTabs();
    expect(restored?.tabs[0]).toEqual({ ...state.tabs[0], history: { ...state.tabs[0].history, typingAt: null } });
    expect(restored?.tabs[1]).toEqual(state.tabs[1]);
    expect(db.set).toHaveBeenCalledTimes(1);
  });
  it('round-trips rich notes and keeps them attached to the correct tab', async () => {
    vi.stubGlobal('window', {});
    vi.stubGlobal('localStorage', { removeItem: vi.fn() });
    const state = { activeId: 'b', tabs: [{ id: 'a', name: 'A', json: '{}', notes: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Important', marks: [{ type: 'bold' }] }] }] } }, { id: 'b', name: 'B', json: '[]' }] };
    db.set.mockImplementation(async (_key, value) => db.get.mockResolvedValue(structuredClone(value)));
    await saveTabs(state);
    expect(await loadTabs()).toEqual(state);
  });
  it('surfaces quota and restore failures instead of reporting success', async () => {
    vi.stubGlobal('window', {});
    db.get.mockRejectedValue(new Error('blocked'));
    db.set.mockRejectedValue(new Error('quota'));
    await expect(loadTabs()).rejects.toThrow('Could not restore');
    await expect(saveTabs({ activeId: 'a', tabs: [] })).rejects.toThrow('not saved');
  });
});
