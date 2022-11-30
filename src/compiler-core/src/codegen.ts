import { NodeTypes } from "./ast";
import { TO_DISPLAY_STRING } from "./runtimeHelpers";

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
