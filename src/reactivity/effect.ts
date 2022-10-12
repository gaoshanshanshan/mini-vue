import { extend } from "../shared/index";

let activeEffect;
// 标记是否应该追踪依赖
// 1.在effect外访问响应式数据，不应该追踪依赖
let shouldTrack;
const targetMap = new Map();

class ReactiveEffect {
  private active = true;
  private deps = new Set();
  constructor(private _fn, public scheduler?, private onStop?: () => void) {}
  run() {
    if (!this.active) {
      return this._fn();
    }
    shouldTrack = true;
    activeEffect = this;
    const result = this._fn();
    shouldTrack = false;
    return result;
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
  effect.deps.clear();
}

export function track(target, key) {
  if (!isTracking()) return;
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
  if (deps.has(activeEffect)) return;
  deps.add(activeEffect);
  activeEffect.deps.add(deps);
}

function isTracking() {
  return shouldTrack && activeEffect !== undefined;
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
