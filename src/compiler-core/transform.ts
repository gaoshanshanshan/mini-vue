import { NodeTypes } from "./ast";
import { TO_DISPLAY_STRING } from "./runtimeHelpers";

/**
 * transform函数通过外部插件完成对ast树的增删改查，为codegen提供有用的信息 
 * transform流程：
 * 1.创建transformContext，context保存了生成节点需要的运行时的helper，也记录了用户传递的转换插件
 * 2.对节点进行递归访问，访问的同时运行用户传入的转换插件。转换插件的执行逻辑可以分为两部分，一部分是进入节点时执行，另一部分通过插件返回的函数，在节点访问完成后执行
 */
export function transform(root, options = {}) {
  const context = createTransformContext(root, options);
  traverseNode(root, context);
  createRootCodegen(root);
  // 记录ast中需要哪些运行时的helper，例如toDisplayString，会在codegen时导入这些helper
  root.helpers = [...context.helpers.keys()];
}

// 构建transformContext
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
  const exitFns: any = [];
  // 执行插件的进入流程逻辑
  if (context.nodeTransforms) {
    context.nodeTransforms.forEach((transform) => {
      const exitFn = transform(node, context);
      if (exitFn) {
        exitFns.push(exitFn);
      }
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

  // 执行插件的退出流程逻辑(访问完整个节点及后代节点后执行)
  let i = exitFns.length;
  while (i--) {
    exitFns[i]();
  }
}

// 递归访问子节点
function traverseChildren(node: any, context: any) {
  node.children.forEach((child) => {
    traverseNode(child, context);
  });
}

// 为codegen生成访问节点
function createRootCodegen(root: any) {
  const child = root.children[0];
  if (child.type === NodeTypes.ELEMENT) {
    root.codegenNode = child.codegenNode;
  } else {
    root.codegenNode = child;
  }
}
