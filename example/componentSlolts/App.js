import { h } from "../../lib/mini-vue.esm.js";
import { Foo } from "./Foo.js";

export const App = {
  name: "App",
  setup() {},
  render() {
    // const fooChildren = h("p", {}, "foo slot content");
    // const fooChildren = [
    //   h("p", {}, "foo slot content"),
    //   h("p", {}, "foo slot content 2"),
    // ];
    // const fooChildren = {
    //   header: h("p", {}, "foo header"),
    //   footer: h("p", {}, "foo footer"),
    // };
    const fooChildren = {
      header: ({ age }) => h("p", {}, `foo header ${age}`),
      footer: () => h("p", {}, "foo footer"),
    };
    return h("div", {}, [
      h("p", { class: "blue" }, "min-vue"),
      h(Foo, {}, fooChildren),
    ]);
  },
};
