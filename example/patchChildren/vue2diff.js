function patch(n1, n2, parent) {}

function vu3diff(prevChildren, nextChildren, parent) {
  let oldStartIndex = 0,
    oldEndIndex = prevChildren.length - 1,
    newStartIndex = 0,
    newEndIndex = nextChildren.length - 1;
  let oldStartNode = prevChildren[oldStartIndex],
    oldEndNode = prevChildren[oldEndIndex],
    newStartNode = nextChildren[newStartIndex],
    newEndNode = nextChildren[newEndIndex];

  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    if (oldStartNode === undefined) {
      oldStartIndex++;
      oldStartNode = prevChildren[oldStartIndex];
      continue;
    } else if (oldEndNode === undefined) {
      oldEndIndex--;
      oldEndNode = prevChildren[oldEndIndex];
      continue;
    } else if (oldStartNode.key === newStartNode.key) {
      patch(oldStartNode, newStartNode, parent);
      oldStartIndex++;
      newStartIndex++;
      oldStartNode = prevChildren[oldStartIndex];
      newStartNode = nextChildren[newStartIndex];
    } else if (oldEndNode.key === newEndNode.key) {
      patch(oldEndNode, newEndNode, parent);
      oldEndIndex--;
      newEndIndex--;
      oldEndNode = prevChildren[oldEndIndex];
      newEndNode = nextChildren[newEndIndex];
    } else if (oldStartNode.key === newEndNode.key) {
      patch(oldStartNode, newEndNode, parent);
      oldStartNode.el.insertBefore(oldEndNode.el.nextSibling);
      oldStartIndex++;
      newEndIndex--;
      oldStartNode = prevChildren[oldStartIndex];
      newEndNode = nextChildren[newEndIndex];
    } else if (oldEndNode.key === newStartNode.key) {
      patch(oldEndNode, newStartNode, parent);
      oldEndNode.el.insertBefore(oldStartNode.el);
      oldEndIndex--;
      newStartIndex++;
      oldEndNode = prevChildren[oldEndIndex];
      newStartNode = nextChildren[newStartIndex];
    } else {
      const oldIndex = prevChildren.findIndex(
        (node) => node.key === newStartNode.key
      );
      if (oldIndex !== -1) {
        const prevNode = prevChildren[oldIndex];
        patch(prevNode, newStartNode, parent);
        prevChildren[oldIndex] = undefined;
        prevNode.el.insertBefore(oldStartNode.el);
      } else {
        patch(null, newStartNodex, parent);
      }
      newStartIndex++;
      newStartNode = nextChildren[newEndIndex];
    }
  }

  if (newEndIndex < newStartIndex) {
    while (oldStartIndex <= oldEndIndex) {
      if (!prevChildren[oldStartIndex]) {
        oldEndIndex++;
        continue;
      }
      unmount(prevChildren[oldStartIndex++].el);
    }
  } else if (oldEndIndex < oldStartIndex) {
    while (newStartIndex <= newEndIndex) {
      patch(null, newStartNode, parent, oldStartNodex.el);
      newStartNode = nextChildren[++newStartIndex];
    }
  }
}
