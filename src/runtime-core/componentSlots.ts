/**
 * slots 实现原理
 * 1.slots实际上就是组件的children，组件的children是个object，通过object的key给slot分组（具名插槽）, key对应的value是函数，定义插槽的组件可以通过该函数向使用插槽的组件传递数据（作用域插槽）。
 *   1.1 children会保存在instace.slots中，方便用户渲染插槽
 * 2.用户在渲染组件的插槽时，可以通过this.$slots拿到插槽对象，然后通过renderSlots辅助函数渲染指定插槽，同时也可以传递数据
 *   2.1 在创建组件的插槽时会将children每个key对应的value函数返回的插槽内容序列化为数组格式，方便renderSlots在渲染插槽内容处理
 */
import { ShapeFlags } from "../shared/ShapeFlags";

export function initSlots(instance, children) {
  const { vnode } = instance;
  if (vnode.shapeFlag & ShapeFlags.SLOTS_CHILDREN) {
    normalizeObjectSlots(children, instance.slots);
  }
}

function normalizeObjectSlots(children: any, slots: any) {
  for (const key in children) {
    const slot = children[key];
    // 通过高阶函数，将插槽函数返回的vnode序列化为vnode数组
    slots[key] = (props) => normalizeSlotValue(slot(props));
  }
}

function normalizeSlotValue(slotValue) {
  return Array.isArray(slotValue) ? slotValue : [slotValue];
}
