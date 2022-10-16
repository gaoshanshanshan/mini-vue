import { ReactiveEffect } from "./effect";
/**
 * 计算属性的特点：懒执行及缓存
 * 核心原理是将ReactiveEffect包装为ref
 * 1.懒执行：将用户传递的getter用ReactiveEffect包装起来，不执行run方法就不会执行getter。getter中的响应式数据发生变化时，会执行自定义的
 * schduler函数,schduler函数将dirty变量置为true
 * 2.缓存：dirty变量为true时代表需要重新计算，会执行effect的run方法重新求值，否则会返回缓存值value
 */
class ComputedRefImpl {
  private _getter: any;
  private _dirty: boolean = true;
  private _value: any;
  private _effect: ReactiveEffect;
  constructor(_getter) {
    this._getter = _getter;
    this._effect = new ReactiveEffect(this._getter, () => {
      if (!this._dirty) {
        this._dirty = true;
      }
    });
  }

  get value() {
    if (this._dirty) {
      this._dirty = false;
      this._value = this._effect.run();
    }
    return this._value;
  }
}

export function computed(getter) {
  return new ComputedRefImpl(getter);
}
