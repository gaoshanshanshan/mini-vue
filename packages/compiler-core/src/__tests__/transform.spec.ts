import { NodeTypes } from "../ast";
import { baseParse } from "../parse";
import { transform } from "../transform";

describe("transform", () => {
  it("happy path", () => {
    const ast = baseParse("<div>hi,{{message}}</div>");
    function plugin(node) {
      if (node.type === NodeTypes.TEXT) {
        node.content = node.content + " mini-vue";
      }
    }
    transform(ast, {
      nodeTransforms: [plugin],
    });
    const textNode = ast.children[0].children[0];
    expect(textNode.content).toBe("hi, mini-vue");
  });
});
