import { h, ref } from "../../dist/mini-vue.esm.js";
import { Child } from "./Child.js";

export const App = {
  setup() {
    const count = ref(0);
    const changeCount = () => count.value++;
    const msg = ref("mini-vue");
    const changeMsg = () => (msg.value = msg.value + "" + Math.random());
    return {
      count,
      changeCount,
      msg,
      changeMsg,
    };
  },
  render() {
    window.self = this;
    return h("div", {}, [
      h("p", { class: "red" }, this.msg),
      h("button", { onClick: this.changeMsg }, "change msg"),
      h(Child, { count: this.count }),
      h("button", { onClick: this.changeCount }, "change count"),
    ]);
  },
};
