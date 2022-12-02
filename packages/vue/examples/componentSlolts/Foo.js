import { h, renderSlots, createTextVNode } from "../../dist/mini-vue.esm.js";

export const Foo = {
  name: "Foo",
  setup() {
    return {};
  },
  render() {
    const fooSlots = this.$slots;
    console.log(this.$slots);
    return h("div", {}, [
      renderSlots(fooSlots, "header", { age: 18 }),
      h("p", {}, `foo`),
      createTextVNode("foo text"),
      renderSlots(fooSlots, "footer"),
    ]);
  },
};
