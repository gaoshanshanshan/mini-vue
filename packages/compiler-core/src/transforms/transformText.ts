import { NodeTypes } from "../ast";
import { isText } from "../utils";

/**
 * 如果element类型的子节点都为text或插值，需要对element的子节点改造，将子节点聚集到compoundExpression类型节点中
 * 需要对ast结构改造
 */
export function transformText(node) {
  if (node.type === NodeTypes.ELEMENT) {
    return () => {
      const { children } = node;
      let currentContainer;
      // 循环子节点
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        // 如果当前子节点为text
        if (isText(child)) {
          // 访问当前子节点的兄弟节点
          for (let j = i + 1; j < children.length; j++) {
            const next = children[j];
            // 如果也是text，将兄弟节点也添加到compoundExpression节点中
            if (isText(next)) {
              // compoundExpression不存在则创建，并将当前子节点替换为compoundExpression节点
              if (!currentContainer) {
                currentContainer = children[i] = {
                  type: NodeTypes.COMPOUND_EXPRESSION,
                  children: [child],
                };
              }
              currentContainer.children.push(" + ");
              currentContainer.children.push(next);
              children.splice(j, 1);
              j--;
            }
            // 不是text，停止循环
            else {
              currentContainer = undefined;
              break;
            }
          }
        }
      }
    };
  }
}
