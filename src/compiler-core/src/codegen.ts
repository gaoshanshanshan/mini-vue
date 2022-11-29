export function generate(ast) {
  const context = createCodegenContext();
  const { push } = context;
  push("return ");
  const functionName = "render";
  const signature = ["_ctx", "_cache"].join(", ");
  // 拼接render函数
  push(`function ${functionName}(${signature}){`);
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
  };
  return context;
}

function genNode(codegenNode: any, context: any) {
  const { push } = context;
  push(`return '${codegenNode.content}'`);
}
