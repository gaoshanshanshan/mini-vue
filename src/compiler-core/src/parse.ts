import { NodeTypes } from "./ast";

export function baseParse(content: string) {
  const context = createParserContext(content);
  return createRoot(parseChildren(context));
}

function parseChildren(context) {
  const nodes: any[] = [];
  let node;
  if (context.source.startsWith("{{")) {
    node = parseInterpolation(context);
  }
  nodes.push(node);
  return nodes;
}

function parseInterpolation(context) {
  const openDelimiter = "{{";
  const closeDelimiter = "}}";

  //消费掉openDelimiter
  advanceBy(context, openDelimiter.length);

  // 找到closeDelimiter，0 ~ closeDelimiter为插值的内容
  const rawContentLength = context.source.indexOf(closeDelimiter);
  // 截取出content
  const rawContent = context.source.slice(0, rawContentLength);
  const content = rawContent.trim();

  // 消费掉插值+closeDelimiter
  advanceBy(context, rawContentLength + closeDelimiter.length);

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content,
    },
  };
}

function createRoot(children) {
  return {
    children,
  };
}

function createParserContext(content: string) {
  return {
    source: content,
  };
}

function advanceBy(context: any, length: number) {
  context.source = context.source.slice(length);
}
