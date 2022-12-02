import { generate } from "./codegen";
import { baseParse } from "./parse";
import { transform } from "./transform";
import { transformElement } from "./transforms/transformElement";
import { transformExpression } from "./transforms/transformsExpression";
import { transformText } from "./transforms/transformText";

// 向外提供compiler
export function baseCompile(template) {
  const ast = baseParse(template);
  transform(ast, {
    nodeTransforms: [transformExpression, transformElement, transformText],
  });
  return generate(ast);
}
