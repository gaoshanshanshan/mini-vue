import { h } from "../../lib/mini-vue.esm.js";
export const App = {
  render() {
    return h("div", {}, [
      h("p", { class: "red" }, "hi"),
      h("p", { class: "blue" }, "min-vue"),
    ]);
  },
  setup() {
    return {
      msg: "hello world",
    };
  },
};
