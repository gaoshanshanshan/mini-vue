import { h } from "../../dist/mini-vue.esm.js";

export const Child = {
  setup(props) {
    return {};
  },
  render() {
    return h("div", { class: "blue" }, `props.count ${this.$props.count}`);
  },
};
