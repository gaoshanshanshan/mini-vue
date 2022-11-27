import { NodeTypes } from "./ast";
/**
 * 将代码字符串解析生成ast树的过程称为parse。
 * 解析流程:
 * 1.构建ast根节点，解析字符串生成的ast节点都是该根节点的子节点，保存在children中
 * 2.通过while循环递归处理代码字符串，根据字符串的标识分别派发给不同的函数，处理为不同类型的ast节点。
 *    2.1 以{{开头交给parseInterPolation处理，截取出插值的内容，生成插值类型的ast节点
 *    2.2 以<\/?[a-z]交给parseElement处理，截取出tag标签，并且会将开始和结束标签之间的内容交给parseChildren递归的处理。最后会生成element ast节点
 *    2.3 以上条件都为命中就认为是text类型，交给parseText处理。parseText会匹配出纯文本的内容，生成text类型的ast节点。
 */

const enum TagTypes {
  Start,
  End,
}

export function baseParse(content: string) {
  const context = createParserContext(content);
  return createRoot(parseChildren(context, []));
}

function parseChildren(context, ancestor) {
  const nodes: any[] = [];
  while (!isEnd(context, ancestor)) {
    const s = context.source;
    let node;
    if (s.startsWith("{{")) {
      node = parseInterpolation(context);
    } else if (s.startsWith("<")) {
      if (/^[a-z]/.test(s[1])) {
        node = parseElement(context, ancestor);
      }
    }
    if (!node) {
      node = parseText(context);
    }
    nodes.push(node);
  }
  return nodes;
}

/**
 * 判断parseChildren是否解析结束，结束条件有两个：
 * 1. 是否碰到结束标签. <div><h1>hi,</h1>vue</div>，开始解析h1时会进入div的parseChildren，当解析完h1，应该完成parseChildren
 * 2. 待解析字符串已经解析完毕
 */
function isEnd(context, ancestor) {
  const s = context.source;
  // 待解析字符串如果以结束标签开头，在标签栈中检查是否存在该标签，如果存在就停止循环，防止遗漏结束标签导致死循环
  if (s.startsWith("</")) {
    for (let index = ancestor.length - 1; index >= 0; index--) {
      const tag = ancestor[index].tag;
      if (startsWithEndTagOpen(s, tag)) {
        return true;
      }
    }
  }
  return !s;
}

// 解析插值
function parseInterpolation(context) {
  const openDelimiter = "{{";
  const closeDelimiter = "}}";

  //消费掉openDelimiter
  advanceBy(context, openDelimiter.length);

  // 找到closeDelimiter，0 ~ closeDelimiter为插值的内容并
  const rawContentLength = context.source.indexOf(closeDelimiter);

  // 截取出content,并消费掉content
  const rawContent = parseTextData(context, rawContentLength);
  const content = rawContent.trim();

  // 消费closeDelimiter
  advanceBy(context, closeDelimiter.length);

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content,
    },
  };
}

// 解析element
function parseElement(context: any, ancestor): any {
  const element: any = parseTag(context, TagTypes.Start);
  // 将解析的element放入标签栈中
  ancestor.push(element);
  // 解析标签中的子节点
  element.children = parseChildren(context, ancestor);
  // 解析完element后将该标签弹出
  ancestor.pop();
  // 验证待解析字符串是否是当前标签的结束标签，如果不是，则说明缺少结束标签
  if (startsWithEndTagOpen(context.source, element.tag)) {
    parseTag(context, TagTypes.End);
  } else {
    throw new Error(`缺少结束标签:${element.tag}`);
  }
  return element;
}

function startsWithEndTagOpen(source: string, tag: string) {
  return source.slice(2, 2 + tag.length) === tag;
}

// 解析开始、结束标签
function parseTag(context: any, type: TagTypes) {
  const match: any = /^<\/?([a-z]*)/i.exec(context.source);

  const tag = match[1];
  advanceBy(context, match[0].length);
  advanceBy(context, 1);
  if (type === TagTypes.End) return;
  return {
    type: NodeTypes.ELEMENT,
    tag,
  };
}

// 解析文本
function parseText(context: any): any {
  let endIndex = context.source.length;
  // 判断文本中有没有插值或标签类型，若果存在截取到插值或标签类型前
  let endTokens = ["<", "{{"];
  for (let i = 0; i < endTokens.length; i++) {
    const index = context.source.indexOf(endTokens[i]);
    if (index > -1 && endIndex > index) {
      endIndex = index;
    }
  }
  const content = parseTextData(context, endIndex);
  return {
    type: NodeTypes.TEXT,
    content,
  };
}

function parseTextData(context: any, length: number) {
  const content = context.source.slice(0, length);
  advanceBy(context, content.length);
  return content;
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
