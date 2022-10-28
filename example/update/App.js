import { h, ref } from "../../lib/mini-vue.esm.js";

export const App = {
  setup() {
    const count = ref(0);
    const attr = ref({
      foo: "foo",
      bar: "bar",
    });
    return {
      onClick() {
        count.value++;
      },
      onChangeFoo() {
        attr.value.foo = "foo value";
      },
      onResetFoo() {
        attr.value.foo = undefined;
      },
      onRemoveFoo() {
        attr.value = {
          bar: "bar",
        };
      },
      count,
      attr,
    };
  },
  render() {
    return h("div", { ...this.attr }, [
      h("p", { class: "red" }, "hi: " + this.count),
      h("button", { class: "blue", onClick: this.onClick }, "点击"),
      h(
        "button",
        { class: "blue", onClick: this.onChangeFoo },
        "点击 修改 foo attr"
      ),
      h(
        "button",
        { class: "blue", onClick: this.onResetFoo },
        "点击 修改 foo attr undefined"
      ),
      h(
        "button",
        { class: "blue", onClick: this.onRemoveFoo },
        "点击 修改 remove foo attr"
      ),
    ]);
  },
};
