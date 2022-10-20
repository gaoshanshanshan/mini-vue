import { h } from "../../lib/mini-vue.esm.js";
import { Foo } from "./Foo.js";

export const App = {
  render() {
    window.self = this;
    return h("div", {}, [
      h("p", { class: "blue" }, "min-vue"),
      h(Foo, {
        count: 1,
        onAdd(a, b) {
          console.log("App onAdd", a, b);
        },
        onFooAdd(a, b) {
          console.log("App onFooAdd", a, b);
        },
      }),
    ]);
  },
  setup() {
    return {
      msg: "mini-vue",
    };
  },
};
