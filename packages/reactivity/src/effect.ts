import { extend } from "@mini-vue/shared";

let activeEffect;
// 标记是否应该追踪依赖
// 1.在effect外访问响应式数据，不应该追踪依赖
let shouldTrack;
const targetMap = new Map();

export class ReactiveEffect {
  private active = true;
  private deps = new Set();
  constructor(private _fn, public scheduler?, public onStop?: () => void) {}
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
  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }
  trackEffects(dep);
}

export function trackEffects(dep) {
  if (dep.has(activeEffect)) return;
  dep.add(activeEffect);
  activeEffect.deps.add(dep);
}

export function isTracking() {
  return shouldTrack && activeEffect !== undefined;
}

export function trigger(target, key) {
  const depsMap = targetMap.get(target);
  const dep = depsMap.get(key);
  triggerEffects(dep);
}

export function triggerEffects(dep) {
  // if (!dep) return;
  for (const effect of dep) {
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
