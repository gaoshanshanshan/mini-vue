import { h, ref } from "../../lib/mini-vue.esm.js";
const prevChild = 'old child text'
const nextChild = "new child text";

export const TextToText = {
  name: "TextToText",
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
