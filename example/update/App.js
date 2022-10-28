import { h, ref } from "../../lib/mini-vue.esm.js";

export const App = {
  render() {
    return h("div", {}, [
      h("p", { class: "red" }, "hi: " + this.count),
      h("button", { class: "blue", onClick: this.onClick }, "点击"),
    ]);
  },
  setup() {
    const count = ref(0);
    return {
      onClick() {
        count.value++;
      },
      count,
    };
  },
};
