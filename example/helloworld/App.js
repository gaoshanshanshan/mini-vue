import { h } from "../../lib/mini-vue.esm.js";
export const App = {
  render() {
    window.self = this;
    return h(
      "div",
      {},
      // [
      //   h("p", { class: "red" }, "hi"),
      //   h("p", { class: "blue" }, "min-vue"),
      // ]
      "hi " + this.msg
    );
  },
  setup() {
    return {
      msg: "mini-vue",
    };
  },
};
