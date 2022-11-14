import { NodeTypes } from "./ast";
const enum TagTypes {
  Start,
  End,
}
export function baseParse(content: string) {
  const context = createParserContext(content);
  return createRoot(parseChildren(context));
}

function parseChildren(context) {
  const nodes: any[] = [];
  const s = context.source;
  let node;
  if (s.startsWith("{{")) {
    node = parseInterpolation(context);
  } else if (s.startsWith("<")) {
    if (/^[a-z]/.test(s[1])) {
      node = parseElement(context);
    }
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

function parseElement(context: any): any {
  const element = parseTag(context, TagTypes.Start);
  parseTag(context, TagTypes.End);
  return element;
}

function parseTag(context: any, type: TagTypes) {
  const match: any = /^<\/?([a-z]*)/i.exec(context.source);
  const tag = match[1];
  advanceBy(context, match[0].length);
  advanceBy(context, 1);
  console.log(match, "---" + context.source);
  if (type === TagTypes.End) return;
  return {
    type: NodeTypes.ELEMENT,
    tag,
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
