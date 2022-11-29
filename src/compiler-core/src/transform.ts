export function transform(root, options) {
  const context = createTransformContext(root, options);
  traverseNode(root, context);
}

function createTransformContext(root: any, options: any) {
  return {
    root,
    nodeTransforms: options.nodeTransforms ?? [],
  };
}

function traverseNode(node: any, context: { root: any; nodeTransforms: any }) {
  // 执行节点访问逻辑
  if (context.nodeTransforms) {
    context.nodeTransforms.forEach((transform) => {
      transform(node);
    });
  }

  // 递归访问节点
  const children = node.children;
  if (children) {
    children.forEach((child) => {
      traverseNode(child, context);
    });
  }
}
