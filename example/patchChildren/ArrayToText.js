import { h, ref } from "../../lib/mini-vue.esm.js";
const prevChild = [h("p", {}, "A"), h("p", {}, "B")];
const nextChild = "child text";

export const ArrayToText = {
  name: "ArrayToText",
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
