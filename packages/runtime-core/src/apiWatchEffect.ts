import { ReactiveEffect } from "@mini-vue/reactivity";
import { queuePreFlushCb } from "./scheduler";

export function watchEffect(source) {
  function job() {
    effect.run();
  }
  let cleanup;
  function onCleanup(fn) {
    cleanup = effect.onStop = () => fn();
  }
  function geeter() {
    if (cleanup) {
      cleanup();
    }
    source(onCleanup);
  }
  const effect = new ReactiveEffect(geeter, () => {
    queuePreFlushCb(job);
  });
  effect.run();
  return () => {
    effect.stop();
  };
}
