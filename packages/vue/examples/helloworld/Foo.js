import { h } from "../../dist/mini-vue.esm.js";

export const Foo = {
  setup(props) {
    console.log(props);
    props.count++;
    console.log(props);
  },
  render() {
    return h("div", {}, `props.count ${this.count}`);
  },
};
