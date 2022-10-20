import { h } from "../../lib/mini-vue.esm.js";

export const Foo = {
  setup(props, { emit }) {
    return {
      handleAdd() {
        console.log("handleAdd");
        emit("add", 1, 2);
        emit("foo-add", 3, 4);
      },
    };
  },
  render() {
    const btn = h(
      "button",
      {
        onClick: () => {
          this.handleAdd();
        },
      },
      "添加"
    );
    return h("div", {}, [h("p", {}, `props.count ${this.count}`), btn]);
  },
};
