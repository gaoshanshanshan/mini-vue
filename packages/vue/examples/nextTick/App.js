import {
  h,
  ref,
  getCurrentInstance,
  nextTick,
} from "../../dist/mini-vue.esm.js";

export const App = {
  setup() {
    const instance = getCurrentInstance();
    const count = ref(0);
    return {
      count,
      async handleClick() {
        for (let i = 0; i < 10; i++) {
          count.value++;
        }
        // await nextTick();
        // console.log(instance);
        nextTick(() => {
          console.log(instance);
        });
      },
    };
  },
  render() {
    return h("div", {}, [
      h("p", { class: "red" }, "hi: " + this.count),
      h("button", { onClick: this.handleClick }, "change count"),
    ]);
  },
};
