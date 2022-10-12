import { track, trigger } from "./effect";
import { ReactiveFlags, readonly, reactive } from "./reactive";
import { extend, isObject } from "../shared/index";

const get = createGetter();
const shallowGet = createGetter(false, true);
const set = createSetter();
const shallowSet = createSetter(true);
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);

function createGetter(isReadonly = false, shallow = false) {
  return function get(target, key) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly;
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly;
    }
    const res = Reflect.get(target, key);
    if (!isReadonly) {
      track(target, key);
    }
    if (shallow) {
      return res;
    }
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res);
    }
    return res;
  };
}

function createSetter(shallow = false) {
  return function set(target, key, value) {
    const res = Reflect.set(target, key, value);
    trigger(target, key);
    return res;
  };
}

export const mutableHandlers = {
  get,
  set,
};

export const shallowReactiveHandlers = {
  get: shallowGet,
  set: shallowSet,
};

export const readonlyHandlers = {
  get: readonlyGet,
  set(target, key) {
    console.warn(`key:${String(key)} 失败，因为 target 是 readonly的`);
    return true;
  },
};

export const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
  get: shallowReadonlyGet,
});
