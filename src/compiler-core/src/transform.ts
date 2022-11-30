import { NodeTypes } from "./ast";
import { TO_DISPLAY_STRING } from "./runtimeHelpers";

export function transform(root, options = {}) {
  const context = createTransformContext(root, options);
  createRootCodegen(root);
  traverseNode(root, context);
  // 记录ast中需要哪些运行时的helper，例如toDisplayString，会在codegen时导入这些helper
  root.helpers = [...context.helpers.keys()];
}

function createTransformContext(root: any, options: any) {
  const context = {
    root,
    nodeTransforms: options.nodeTransforms ?? [],
    helpers: new Map(),
    helper(key) {
      context.helpers.set(key, 1);
    },
  };
  return context;
}

function traverseNode(node: any, context: any) {
  // 执行节点访问逻辑
  if (context.nodeTransforms) {
    context.nodeTransforms.forEach((transform) => {
      transform(node);
    });
  }

  // 根据节点类型记录运行时需要的helper
  switch (node.type) {
    case NodeTypes.INTERPOLATION:
      context.helper(TO_DISPLAY_STRING);
      break;
    case NodeTypes.ROOT:
    case NodeTypes.ELEMENT:
      // 递归访问节点
      traverseChildren(node, context);
      break;
  }
}

function traverseChildren(node: any, context: any) {
  node.children.forEach((child) => {
    traverseNode(child, context);
  });
}

// 为codegen生成访问节点
function createRootCodegen(root: any) {
  root.codegenNode = root.children[0];
}
