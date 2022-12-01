import { isString } from "../shared";
import { NodeTypes } from "./ast";
import { CREATE_ELEMENT_VNODE, TO_DISPLAY_STRING } from "./runtimeHelpers";

/**
 * codegen：根据ast树生成render函数
 * 1. 构建codegenContext，context保存了生成的代码片段，添加代码片段的方法，以及转换helper的辅助函数
 * 2. 根据tranform中记录在ast中的运行时helper，将运行时需要的helper生成为代码片段
 * 3. 拼接处render函数声明
 * 4. 递归访问ast节点，生成render函数函数体
 *    4.1 text类型节点，直接拼接node.content
 *    4.2 interpolation类型节点，先添加对插值的helper函数调用，在通过expression类型节点对表达式的访问
 *    4.3 expression类型节点，在transform中通过transformText插件，完成了对表达式的修改，添加了运行时的_ctx.的前缀添加。直接使用node.content
 *    4.3 element类型节点，先添加对element类型的createElementVNode函数的调用，再递归生成子节点。
 *        生成子节点时，如果子节点都是text或者插值类型，则会将子节点聚集到comoundExpression节点中，会在各个子节点中间插入字符串"+"完成节点之间的拼接。
 *        这一步是通过transformText插件完成的
 */
export function generate(ast) {
  const context = createCodegenContext();
  const { push } = context;
  // 根据ast的运行时helper，生成导入语句。例如 const {toDisplayString} = Vue
  genFunctionPreamble(ast, context);
  const functionName = "render";
  const signature = ["_ctx", "_cache"].join(", ");
  // 拼接render函数
  push(`function ${functionName}(${signature}){`);
  push("return ");
  // 解析节点生成对应代码
  genNode(ast.codegenNode, context);
  push(`}`);
  return {
    code: context.code,
  };
}

// 构建codegenContext
function createCodegenContext() {
  const context = {
    code: "",
    push(str) {
      context.code += str;
    },
    helper(key) {
      return `_${key}`;
    },
  };
  return context;
}

function genFunctionPreamble(ast: any, context: any) {
  const { push } = context;
  if (ast.helpers.length) {
    const VueBinging = "Vue";
    const aliasHelper = (s: string) => `${s}:_${s}`;
    push(
      `const { ${ast.helpers.map(aliasHelper).join(", ")} } = ${VueBinging}`
    );
  }
  push("\n");
  push("return ");
}

function genNode(node: any, context: any) {
  switch (node.type) {
    case NodeTypes.TEXT:
      genText(node, context);
      break;
    case NodeTypes.INTERPOLATION:
      genInterpolation(node, context);
      break;
    case NodeTypes.SIMPLE_EXPRESSION:
      genExpression(node, context);
      break;
    case NodeTypes.ELEMENT:
      genElement(node, context);
      break;
    case NodeTypes.COMPOUND_EXPRESSION:
      genCompoundExpression(node, context);
      break;
    default:
      break;
  }
}

// 生成文本类型节点代码
function genText(node: any, context: any) {
  const { push } = context;
  push(`'${node.content}'`);
}

// 生成字符串表达式类型节点代码
function genInterpolation(node: any, context: any) {
  const { push, helper } = context;
  push(`${helper(TO_DISPLAY_STRING)}(`);
  genExpression(node.content, context);
  push(`)`);
}

// 生成普通表达式节点类型代码
function genExpression(node: any, context: any) {
  const { push } = context;
  push(node.content);
}

// 生成element节点类型代码
function genElement(node: any, context: any) {
  const { tag, props, children } = node;
  const { push, helper } = context;
  push(`${helper(CREATE_ELEMENT_VNODE)}(`);
  genNodeList(genNullable([tag, props, children]), context);
  push(")");
}

// 生成computedExpression类型代码
function genCompoundExpression(node: any, context: any) {
  const { push } = context;
  const { children } = node;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (isString(child)) {
      push(child);
    } else {
      genNode(child, context);
    }
  }
}

function genNodeList(nodes: any[], context: any) {
  const { push } = context;
  nodes.forEach((node, i) => {
    if (isString(node)) {
      push(node);
    } else {
      genNode(node, context);
    }
    if (i < nodes.length - 1) {
      push(", ");
    }
  });
}

function genNullable(args: any[]) {
  return args.map((arg) => arg || "null");
}
