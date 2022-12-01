export const enum NodeTypes {
  INTERPOLATION,
  SIMPLE_EXPRESSION,
  ELEMENT,
  TEXT,
  ROOT,
  COMPOUND_EXPRESSION,
}

export function createVNodeCall(tag, props, children) {
  return {
    type: NodeTypes.ELEMENT,
    tag,
    props,
    children,
  };
}
