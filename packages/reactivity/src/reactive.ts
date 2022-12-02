import {
  mutableHandlers,
  readonlyHandlers,
  shallowReactiveHandlers,
  shallowReadonlyHandlers,
} from "./baseHandlers";

export const enum ReactiveFlags {
  IS_REACTIVE = "__v_is_reactive",
  IS_READONLY = "__v_is_readonly",
}

export function reactive(raw) {
  return createActiveObject(raw, mutableHandlers);
}

export function shallowReactive(raw) {
  return createActiveObject(raw, shallowReactiveHandlers);
}

export function readonly(raw) {
  return createActiveObject(raw, readonlyHandlers);
}

export function shallowReadonly(raw) {
  return createActiveObject(raw, shallowReadonlyHandlers);
}

export function isReactive(value) {
  return !!value[ReactiveFlags.IS_REACTIVE];
}

export function isReadonly(value) {
  return !!value[ReactiveFlags.IS_READONLY];
}

export function isProxy(value) {
  return isReactive(value) || isReadonly(value);
}

function createActiveObject(raw: any, baseHandlers) {
  return new Proxy(raw, baseHandlers);
}
