import { camelize, toHandlerKey } from "@mini-vue/shared";

export function emit(instance, event, ...args) {
  const { props } = instance;
  const handler = props[toHandlerKey(camelize(event))];
  handler && handler(...args);
}
