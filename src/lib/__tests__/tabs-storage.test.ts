import { afterEach, describe, expect, it, vi } from "vitest";
const db = vi.hoisted(() => ({ get: vi.fn(), set: vi.fn() }));
vi.mock('../json-prism-idb', () => ({ idbGet: db.get, idbSet: db.set }));
import { loadTabs, saveTabs } from '../tabs-storage';
afterEach(() => { vi.resetAllMocks(); vi.unstubAllGlobals(); });
describe('tab and notes persistence', () => {
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
