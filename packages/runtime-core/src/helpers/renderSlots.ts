import { h } from "../h";
import { Fragment } from '../vnode';

export function renderSlots(slots, name, props) {
  const slot = slots[name];
  if (slot) {
    return h(Fragment, {}, slot(props));
  }
}
