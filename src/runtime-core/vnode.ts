export function createVNode(type, props?, children?) {
  return {
    type,
    el: null,
    props,
    children,
  };
}
