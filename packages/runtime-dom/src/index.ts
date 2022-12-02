import { createRenderer } from "@mini-vue/runtime-core";
export * from "@mini-vue/runtime-core";

function createElement(type) {
  return document.createElement(type);
}

function patchProp(el, key, prevValue, nextValue) {
  const isOn = (key) => /^on[A-Z]/.test(key);
  if (isOn(key)) {
    const eventName = key.slice(2).toLowerCase();
    el.addEventListener(eventName, nextValue);
  } else {
    if (nextValue !== null && nextValue !== undefined) {
      el.setAttribute(key, nextValue);
    } else {
      el.removeAttribute(key);
    }
  }
}

function insert(el, parent, anchor) {
  parent.insertBefore(el, anchor);
}

function remove(el) {
  const parent = el.parentNode;
  if (parent) {
    parent.removeChild(el);
  }
}

function setElementText(el, text) {
  el.textContent = text;
}

// 1.创建dom环境的渲染器
const renderer = createRenderer({
  createElement,
  patchProp,
  insert,
  remove,
  setElementText,
});

// 2.渲染器会包装一个createApp函数，因为createApp依赖渲染器提供的render函数
export function createApp(...params) {
  return renderer.createApp(...(params as [any]));
}
