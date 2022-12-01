import { ref } from "../../lib/mini-vue.esm.js";

export const App = {
  template: "<div>hi,{{count}}</div>",
  setup() {
    const count = (window.count = ref(1));
    return { message: "mini-vue", count };
  },
};
