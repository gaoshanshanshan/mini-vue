import { h } from "../../lib/mini-vue.esm.js";
// import { ArrayToText } from "./ArrayToText.js";
// import { TextToText } from "./TextToText.js";
import { TextToArray } from "./TextToArray.js";

export const App = {
  name: "App",
  setup() {
    return {};
  },
  render() {
    return h("div", {}, [h(TextToArray)]);
  },
};
