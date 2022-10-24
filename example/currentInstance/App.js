import { h, getCurrentInstance } from "../../lib/mini-vue.esm.js";
import { Foo } from "./Foo.js";

export const App = {
  name: "App",
  render() {
    return h("div", {}, [
      h("p", { class: "red" }, "hi"),
      h("p", { class: "blue" }, "min-vue"),
      h(Foo, { count: 1 }),
    ]);
  },
  setup() {
    const instance = getCurrentInstance();
    console.log("App: ", instance);
  },
};
