import { h } from "../../dist/mini-vue.esm.js";
import { Foo } from "./Foo.js";

export const App = {
  render() {
    window.self = this;
    return h(
      "div",
      {
        onClick() {
          console.log("click");
        },
        onMousedown() {
          console.log("mouse down");
        },
      },
      [
        h("p", { class: "red" }, "hi"),
        h("p", { class: "blue" }, "min-vue"),
        h(Foo, { count: 1 }),
      ]
      // "hi " + this.msg
    );
  },
  setup() {
    return {
      msg: "mini-vue",
    };
  },
};
