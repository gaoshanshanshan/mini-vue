import { NodeTypes } from "../ast";

// 修改插值的表达式，添加_ctx前缀，运行时需要
export function transformExpression(node) {
  if (node.type === NodeTypes.INTERPOLATION) {
    node.content.content = `_ctx.${node.content.content}`;
  }
}
