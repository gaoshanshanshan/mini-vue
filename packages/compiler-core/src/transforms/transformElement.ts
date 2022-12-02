import { NodeTypes, createVNodeCall } from "../ast";
import { CREATE_ELEMENT_VNODE } from "../runtimeHelpers";

// 对element类型节点完成改造
export function transformElement(node, context) {
  if (node.type === NodeTypes.ELEMENT) {
    context.helper(CREATE_ELEMENT_VNODE);
    return () => {
      const vnodeTag = `"${node.tag}"`;
      let vnodeProps;
      const children = node.children;
      const vnodeChildren = children[0];
      node.codegenNode = createVNodeCall(vnodeTag, vnodeProps, vnodeChildren);
    };
  }
}
