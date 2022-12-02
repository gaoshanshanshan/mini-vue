import { h, provide, inject } from "../../dist/mini-vue.esm.js";

const ProvideWrapper = {
  name: "ProvideWrapper",
  setup() {
    provide("foo", "foo value");
    provide("bar", "bar value");
  },
  render() {
    return h("div", {}, [
      h("p", {}, "provide wrapper"),
      h(ProvideWrapperTwo, {}),
    ]);
  },
};

const ProvideWrapperTwo = {
  name: "ProvideWrapperTwo",
  setup() {
    provide("foo", "foo two value");
    provide("bar", "bar two value");
    const foo = inject("foo");
    return {
      foo,
    };
  },
  render() {
    return h("div", {}, [
      h("p", { class: "red" }, `provide wrapper two foo: ${this.foo}`),
      h(Consumer, {}),
    ]);
  },
};

const Consumer = {
  name: "Consumer",
  setup() {
    const foo = inject("foo");
    const bar = inject("bar");
    const baz = inject("baz", () => "baz");
    console.log(foo, bar, baz);
    return {
      foo,
      bar,
      baz,
    };
  },
  render() {
    return h("div", {}, [
      h("p", {}, this.foo),
      h("p", {}, this.bar),
      h("p", {}, this.baz),
    ]);
  },
};

export const App = {
  name: "App",
  render() {
    return h("div", {}, [h(ProvideWrapper, {})]);
  },
  setup() {},
};
