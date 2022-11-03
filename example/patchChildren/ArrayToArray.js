import { h, ref } from "../../lib/mini-vue.esm.js";

// 1. 处理左侧相同节点
// (a b) c
// (a b) d e
// const prevChild = [
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "C" }, "C"),
// ];
// const nextChild = [
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "D" }, "D"),
//   h("p", { key: "E" }, "E"),
// ];

// 2. 处理右侧相同节点
// a (b c)
// d e (b c)
// const prevChild = [
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "C" }, "C"),
// ];
// const nextChild = [
//   h("p", { key: "D" }, "D"),
//   h("p", { key: "E" }, "E"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "C" }, "C"),
// ];

// 3. 处理右侧新增节点
// (a b )
// (a b ) c d
// const prevChild = [h("p", { key: "A" }, "A"), h("p", { key: "B" }, "B")];
// const nextChild = [
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "C" }, "C"),
//   h("p", { key: "D" }, "D"),
// ];

// 处理左侧新增节点
//   (a b)
// c (a b)
// const prevChild = [h("p", { key: "A" }, "A"), h("p", { key: "B" }, "B")];
// const nextChild = [
//   h("p", { key: "C" }, "C"),
//   h("p", {key: "D" }, "D"),
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
// ];

// 4. 删除右侧多余节点
// (a b ) c d
// (a b )
// const prevChild = [
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "C" }, "C"),
//   h("p", { key: "D" }, "D"),
// ];
// const nextChild = [h("p", { key: "A" }, "A"), h("p", { key: "B" }, "B")];

// 删除左侧多余节点
// c d (a b)
//     (a b)
// const prevChild = [
//   h("p", { key: "C" }, "C"),
//   h("p", { key: "D" }, "D"),
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
// ];
// const nextChild = [h("p", { key: "A" }, "A"), h("p", { key: "B" }, "B")];

// 5.处理中间节点

// 5.1 移除新列表中不存在节点
// a b (c d) f g
// a b (d e) f g
// const prevChild = [
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "C" }, "C"),
//   h("p", { key: "D" }, "D"),
//   h("p", { key: "F" }, "F"),
//   h("p", { key: "G" }, "G"),
// ];
// const nextChild = [
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "D" }, "D"),
//   h("p", { key: "E" }, "E"),
//   h("p", { key: "F" }, "F"),
//   h("p", { key: "G" }, "G"),
// ];
// 优化：旧列表待移除的节点比新列表中待比较的节点多时，直接将节点移除
// a b (c d h) f g
// a b (d c) f g
// const prevChild = [
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "C" }, "C"),
//   h("p", { key: "D" }, "D"),
//   h("p", { key: "H" }, "H"),
//   h("p", { key: "F" }, "F"),
//   h("p", { key: "G" }, "G"),
// ];
// const nextChild = [
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "D" }, "D"),
//   h("p", { key: "C" }, "C"),
//   h("p", { key: "F" }, "F"),
//   h("p", { key: "G" }, "G"),
// ];

// 5.2 新旧列表节点存在，移动位置
// a b (c d e) f g
// a b (e c d) f g
// const prevChild = [
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "C" }, "C"),
//   h("p", { key: "D" }, "D"),
//   h("p", { key: "E" }, "E"),
//   h("p", { key: "F" }, "F"),
//   h("p", { key: "G" }, "G"),
// ];
// const nextChild = [
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "E" }, "E"),
//   h("p", { key: "C" }, "C"),
//   h("p", { key: "D" }, "D"),
//   h("p", { key: "F" }, "F"),
//   h("p", { key: "G" }, "G"),
// ];

// 5.3 新列表新增节点
// a b (d e h) f g
// a b (c d e) f g
const prevChild = [
  h("p", { key: "A" }, "A"),
  h("p", { key: "B" }, "B"),
  h("p", { key: "D" }, "D"),
  h("p", { key: "E" }, "E"),
  h("p", { key: "H" }, "H"),
  h("p", { key: "F" }, "F"),
  h("p", { key: "G" }, "G"),
];
const nextChild = [
  h("p", { key: "A" }, "A"),
  h("p", { key: "B" }, "B"),
  h("p", { key: "C" }, "C"),
  h("p", { key: "D" }, "D"),
  h("p", { key: "E" }, "E"),
  h("p", { key: "F" }, "F"),
  h("p", { key: "G" }, "G"),
];
export const ArrayToArray = {
  name: "ArrayToArray",
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
