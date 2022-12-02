import { hasChanged, isObject } from "@mini-vue/shared";
import { trackEffects, isTracking, triggerEffects } from "./effect";
import { reactive } from "./reactive";

class RefImpl {
  private _rawValue;
  private _value;
  private dep = new Set();
  public __is_ref = true;

  constructor(value) {
    this._rawValue = value;
    this._value = convert(value);
  }

  get value() {
    trackRefValue(this.dep);
    return this._value;
  }

  set value(newVal) {
    if (!hasChanged(newVal, this._rawValue)) return;
    this._rawValue = newVal;
    this._value = convert(newVal);
    triggerEffects(this.dep);
  }
}

function convert(value) {
  return isObject(value) ? reactive(value) : value;
}

function trackRefValue(dep) {
  if (isTracking()) {
    trackEffects(dep);
  }
}

export function ref(value) {
  return new RefImpl(value);
}

export function isRef(ref) {
  return !!ref.__is_ref;
}

export function unRef(ref) {
  return isRef(ref) ? ref.value : ref;
}

export function proxyRef(objectWithRef) {
  return new Proxy(objectWithRef, {
    get(target, key) {
      return unRef(Reflect.get(target, key));
    },
    set(target, key, value) {
      if (isRef(target[key]) && !isRef(value)) {
        return (target[key].value = value);
      } else {
        return Reflect.set(target, key, value);
      }
    },
  });
}
