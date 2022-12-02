import { reactive } from "@mini-vue/reactivity";
import { watchEffect } from "../src/apiWatchEffect";
import { nextTick } from "../src/scheduler";
import { vi } from 'vitest';

describe("watchEffect", () => {
  it("effect", async () => {
    const state = reactive({ count: 0 });
    let dummy;
    watchEffect(() => {
      dummy = state.count;
    });
    expect(dummy).toBe(0);
    state.count++;
    await nextTick();
    expect(dummy).toBe(1);
  });
  it("stopping the wathcer", async () => {
    const state = reactive({ count: 0 });
    let dummy;
    const stop = watchEffect(() => {
      dummy = state.count;
    });
    stop();
    state.count++;
    await nextTick();
    expect(dummy).toBe(0);
  });
  it("cleanup registraion", async () => {
    const fn = vi.fn();
    const state = reactive({ count: 0 });
    let dummy;

    const stop = watchEffect((onCleanup) => {
      onCleanup(fn);
      dummy = state.count;
    });
    expect(dummy).toBe(0);
    state.count++;
    await nextTick();
    expect(fn).toHaveBeenCalledTimes(1);
    expect(dummy).toBe(1);

    stop();
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
