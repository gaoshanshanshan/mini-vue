import { h, renderSlots } from "../../lib/mini-vue.esm.js";

export const Foo = {
  setup() {
    return {};
  },
  render() {
    const fooSlots = this.$slots;
    console.log(this.$slots);
    return h("div", {}, [
      renderSlots(fooSlots, "header", { age: 18 }),
      h("p", {}, `foo`),
      renderSlots(fooSlots, "footer"),
    ]);
  },
};
