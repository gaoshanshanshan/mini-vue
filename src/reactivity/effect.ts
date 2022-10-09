import { extend } from "../shared/index";
class ReactiveEffect {
  private active = true;
  private deps = new Set();
  constructor(private _fn, public scheduler?, private onStop?: () => void) {}
  run() {
    activeEffect = this;
    return this._fn();
  }
  stop() {
    if (this.active) {
      cleanEffect(this);
      if (this.onStop) {
        this.onStop();
      }
      this.active = false;
    }
  }
}

function cleanEffect(effect) {
  effect.deps.forEach((deps: any) => {
    deps.delete(effect);
  });
}

let activeEffect;
const targetMap = new Map();
export function track(target, key) {
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }
  let deps = depsMap.get(key);
  if (!deps) {
    deps = new Set();
    depsMap.set(key, deps);
  }
  if (!activeEffect) return;
  deps.add(activeEffect);
  activeEffect.deps.add(deps);
}

export function trigger(target, key) {
  const depsMap = targetMap.get(target);
  const deps = depsMap.get(key);
  if (!deps) return;
  for (const effect of deps) {
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  }
}

export function effect(fn, options: any = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler);
  extend(_effect, options);
  _effect.run();
  const runner: any = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
}

export function stop(runner) {
  runner.effect.stop();
}
