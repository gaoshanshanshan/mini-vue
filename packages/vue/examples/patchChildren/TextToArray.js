import { h, ref } from "../../dist/mini-vue.esm.js";
const prevChild = "child text";
const nextChild = [h("p", {}, "A"), h("p", {}, "B")];

export const TextToArray = {
  name: "TextToArray",
  setup() {
    const changeFlag = ref(false);
    window.changeFlag = changeFlag;
    return {
      changeFlag,
    };
  },
  render() {
    return h("div", {}, this.changeFlag ? nextChild : prevChild);
  },
};
