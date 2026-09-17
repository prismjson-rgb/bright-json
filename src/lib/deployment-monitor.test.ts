import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { DEPLOYMENT_AWAY_THRESHOLD, startDeploymentMonitor } from "./deployment-monitor";

const running = "a".repeat(40);
const newer = "b".repeat(40);
let stop = () => {};
let page: EventTarget & { visibilityState: string };
const request = vi.fn();
const update = vi.fn();
const marker = (sha: string) => ({ ok: true, json: async () => ({ environment: "production", sha }) });
async function returnAfter(milliseconds = DEPLOYMENT_AWAY_THRESHOLD) {
  page.visibilityState = "hidden";
  page.dispatchEvent(new Event("visibilitychange"));
  await vi.advanceTimersByTimeAsync(milliseconds);
  page.visibilityState = "visible";
  page.dispatchEvent(new Event("visibilitychange"));
  await vi.advanceTimersByTimeAsync(0);
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(0);
  page = Object.assign(new EventTarget(), { visibilityState: "visible" });
  vi.stubGlobal("document", page);
  vi.stubGlobal("window", new EventTarget());
  vi.stubGlobal("fetch", request);
  request.mockReset().mockResolvedValue(marker(running));
  update.mockReset();
});
afterEach(() => { stop(); vi.unstubAllGlobals(); vi.useRealTimers(); });

it("detects a stale bundle after returning from 30 minutes away and bypasses browser cache", async () => {
  request.mockResolvedValue(marker(newer));
  stop = startDeploymentMonitor(running, update);
  await returnAfter();
  expect(update).toHaveBeenCalledWith(true);
  expect(request).toHaveBeenCalledWith("/deployment.json", expect.objectContaining({ cache: "no-store" }));
});

it("checks on qualifying returns and clears the notice after a rollback", async () => {
  stop = startDeploymentMonitor(running, update);
  await returnAfter();
  expect(update).toHaveBeenLastCalledWith(false);
  request.mockResolvedValue(marker(newer));
  await returnAfter();
  expect(update).toHaveBeenLastCalledWith(true);
  request.mockResolvedValue(marker(running));
  await returnAfter();
  expect(update).toHaveBeenLastCalledWith(false);
});

it("handles initially hidden tabs and ignores duplicate visibility and focus events", async () => {
  page.visibilityState = "hidden";
  stop = startDeploymentMonitor(running, update);
  await vi.advanceTimersByTimeAsync(DEPLOYMENT_AWAY_THRESHOLD);
  expect(request).not.toHaveBeenCalled();
  page.visibilityState = "visible";
  page.dispatchEvent(new Event("visibilitychange"));
  await vi.advanceTimersByTimeAsync(0);
  window.dispatchEvent(new Event("focus"));
  page.dispatchEvent(new Event("visibilitychange"));
  await vi.advanceTimersByTimeAsync(0);
  expect(request).toHaveBeenCalledTimes(1);
});

it("ignores network failures and malformed markers, then recovers", async () => {
  request.mockRejectedValueOnce(new Error("offline"))
    .mockResolvedValueOnce(marker("local"))
    .mockResolvedValueOnce({ ok: false })
    .mockResolvedValueOnce(marker(newer));
  stop = startDeploymentMonitor(running, update);
  await returnAfter();
  await returnAfter();
  await returnAfter();
  expect(update).not.toHaveBeenCalled();
  await returnAfter();
  expect(update).toHaveBeenCalledWith(true);
});

it("removes the visibility listener after unmount", async () => {
  stop = startDeploymentMonitor(running, update);
  stop();
  await returnAfter();
  window.dispatchEvent(new Event("focus"));
  expect(request).not.toHaveBeenCalled();
});

it("does not poll in development builds without a release SHA", async () => {
  stop = startDeploymentMonitor(undefined, update);
  await returnAfter();
  expect(request).not.toHaveBeenCalled();
});

it("makes no initial, periodic, focus, reconnect, or short-absence requests", async () => {
  stop = startDeploymentMonitor(running, update);
  await vi.advanceTimersByTimeAsync(24 * 60 * 60 * 1000);
  window.dispatchEvent(new Event("focus"));
  window.dispatchEvent(new Event("online"));
  await returnAfter(DEPLOYMENT_AWAY_THRESHOLD - 1);
  await returnAfter(DEPLOYMENT_AWAY_THRESHOLD - 1);
  expect(request).not.toHaveBeenCalled();
  expect(vi.getTimerCount()).toBe(0);
});
