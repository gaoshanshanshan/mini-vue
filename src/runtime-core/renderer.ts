import { createComponentInstance, setupComponent } from "./component";
import { ShapeFlags } from "../shared/ShapeFlags";
import { Fragment, Text } from "./vnode";
import { createAppAPI } from "./createApp";
import { effect } from "../reactivity";
import { EMPTY_OBJ } from "../shared";
import { shouldUpdateComponent } from "./componentUpdateUtils";
import { queueJob } from "./scheduler";

/**
 * 渲染流程
 * 1. render接收vnode，交给patch方法。patch方法为渲染入口，在遇到子vnode时会递归调用，执行渲染逻辑。
 * 2. patch会区分vnode类型，component交给processConponent，element交给processElement,fragment交给processFragment，text交给processText
 * 3. processElement会区分是挂载还是更新元素，挂载元素交给mountElement执行
 *    3.1 mountElement流程
 *      3.1.1 依据vnode.type创建对应的真实dom
 *      3.1.2 处理props，遍历props添加至dom的attrbute
 *      3.1.3 处理children。children为字符串类型直接通过textContent创建；
 *            children为数组，假设数组元素都为vnode，通过patch递归的渲染子vnode
 * 4. processComponent会区分是挂载还是更新组件，挂载组件交给mountComponent执行
 *    4.1 mountComponent流程
 *      4.1.1 依据vnode创建组件实例
 *      4.1.2 调用setupComponet初始化组件props、slots及调用setup函数拿到组件初始状态数据，最后保证render函数的存在
 *      4.1.3 调用setupRenderEffect执行render函数拿到subTree，渲染subTree（component可以理解为一组状态和视图的封装，
 *            要想渲染component，先要实例化组件，然后初始化其状态，最后再渲染组件的视图)；初始化过程可以叫做开箱的过程。
 * 5. processFragment用来处理fragment类型节点，fragment的实现原理是不渲染节点，直接将children挂载到父vnode中，所以直接调用moutChiren将container传递即可
 * 6. processText用来处理text类型节点，实现原理是创建textNode类型dom，然后将该dom挂载到container中。记得通过text类型vnode.el
 */
export function createRenderer(options) {
  const {
    createElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText,
  } = options;

  function render(vnode, container) {
    patch(null, vnode, container, null, null);
  }

  function patch(n1, n2: any, container: any, parentComponent, anchor) {
    const { type } = n2;
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent, anchor);
        break;
      case Text:
        processText(n1, n2, container, anchor);
        break;
      default:
        const { shapeFlag } = n2;
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent, anchor);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent, anchor);
        }
        break;
    }
  }

  function processElement(
    n1,
    n2: any,
    container: any,
    parentComponent,
    anchor
  ) {
    if (!n1) {
      mountElement(n2, container, parentComponent, anchor);
    } else {
      updateElement(n1, n2, container, parentComponent, anchor);
    }
  }

  function mountElement(vnode: any, container: any, parentComponent, anchor) {
    const { type, props, children, shapeFlag } = vnode;
    const el = (vnode.el = createElement(type));

    // 处理子节点
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, children);
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el, parentComponent, anchor);
    }

    // 处理props
    for (const key in props) {
      const val = props[key];
      hostPatchProp(el, key, null, val);
    }

    // 挂载节点
    hostInsert(el, container, anchor);
  }

  function updateElement(n1: any, n2: any, container, parentComponent, anchor) {
    const el = (n2.el = n1.el);
    const oldProp = n1.props || EMPTY_OBJ;
    const newProp = n2.props || EMPTY_OBJ;
    patchProp(el, oldProp, newProp);
    patchChildren(n1, n2, el, parentComponent, anchor);
  }

  function patchProp(el, oldProps, newProps) {
    if (oldProps !== newProps) {
      for (const key in newProps) {
        const prev = oldProps[key];
        const next = newProps[key];
        if (prev !== next) {
          hostPatchProp(el, key, prev, next);
        }
      }
    }
    if (oldProps !== EMPTY_OBJ) {
      for (const key in oldProps) {
        if (!(key in newProps)) {
          hostPatchProp(el, key, oldProps[key], null);
        }
      }
    }
  }

  function patchChildren(n1, n2, container, parentComponent, anchor) {
    const { shapeFlag: prevShageFlag, children: c1 } = n1;
    const { shapeFlag, children: c2 } = n2;

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (prevShageFlag & ShapeFlags.ARRAY_CHILDREN) {
        unmountChildren(c1);
      }
      if (c1 !== c2) {
        hostSetElementText(container, c2);
      }
    } else {
      if (prevShageFlag & ShapeFlags.TEXT_CHILDREN) {
        hostSetElementText(container, "");
        mountChildren(c2, container, parentComponent, anchor);
      } else {
        patchKeyedChildren(c1, c2, container, parentComponent, anchor);
      }
    }
  }

  // diff 算法
  // 1.使用三个索引 i e1 e2 分别指向新旧列表的起始位置、旧列表的结束位置、新列表的结束位置
  // 2.前置后置相同节点处理，可以缩小新旧列表的对比范围
  //   2.1 通过递增索引i对比新旧列表的起始位置节点，将相同的前置节点处理完毕
  //   2.2 通过递减索引e1、e2, 对比新旧列表的结束位置节点，将相同的后置节点处理完毕
  // 3.处理完前置后置相同节点后，此时索引i可能会 > e1或 > e2
  //   3.1 i > e1,代表旧节点已经处理完毕，新节点还未处理完毕，新节点比旧节点数量多，有节点新增。那么新增节点的范围就是i<=e2之间的节点
  //   3.2 i > e2,代表新节点已经处理完毕，旧节点还未处理完毕，旧节点比新节点数量多，需要将多余的节点移除。那么移除节点的范围就是i<=e1之前的节点。
  // 4.处理完前置后置相同节点后，索引i既不 > e1 也不 > e2，代表新旧节点尚未处理完毕
  //   未处理的节点可以分为三种情况：
  //   一.旧列表节点在新列表中不存在（需要删除）
  //   可以通过遍历旧列表中尚未处理的节点，去新列表中查找，如果查找不到就删除当前节点
  //   二.旧列表节点在新列表中存在，但是位置变了（需要移动）
  //   遍历旧列表中尚未处理的节点，如果在列表中查找到了，然后通过维护maxNewIndexSoFar变量来判断是否需要移动。
  //   maxNewIndexSoFar保存的是新元素的索引是否是递增，递增代表旧节点在新列表中顺序是相对不变的，不需要移动，反之则代表当前节点需要移动。
  //   移动的步骤：
  //   1.创建出新列表中未处理节点在老列表中索引的数组（newIndexToOldIndexMap)
  //   2.求出newIndexToOldIndexMap的最长递增子序列。该序列代表新元素在老列表中相对位置没有变化的节点，代表不需要移动的节点。
  //   3.遍历新列表尚未处理的节点。如果在最长递增子序列中，则不需要移动；如果不在序列中，则移动该节点。
  //   三.新列表节点在旧列表中不存在（需要新增）
  //      在创建新列表中未处理节点在老列表中索引的数组时，如果该节点未在老列表中存在，可以将该索引标记为一个特殊值。
  //      然后在最终移动节点的步骤中，判断如果当前节点是特殊值，则代表需要创建该节点，然后添加到页面中
  function patchKeyedChildren(
    c1: any,
    c2: any,
    container,
    parentComponent,
    parentAnchor
  ) {
    const l2 = c2.length;
    let i = 0;
    let e1 = c1.length - 1;
    let e2 = l2 - 1;

    function isSameVNodeType(n1: any, n2: any) {
      return n1.type === n2.type && n1.key === n2.key;
    }

    // 1. 处理左侧相同节点
    // (a b) c
    // (a b) d e
    // i=2 e1=2 e2=3
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }
      i++;
    }
    // 2. 处理右侧相同节点
    //   a (b c)
    // d e (b c)
    // i=0 e1=0 e2=1
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }
      e1--;
      e2--;
    }
    // 3. 处理两侧新增节点
    // 3.1 右侧新增
    // (a b)
    // (a b) c d
    // i=2 e1=1 e2=3
    // 3.2 左侧新增
    //     (a b)
    // c d (a b)
    // i=0 e1=-1 e2=1
    if (i > e1) {
      const nextPost = e2 + 1;
      const anchor = nextPost < l2 ? c2[nextPost].el : null;
      while (i <= e2) {
        patch(null, c2[i], container, parentComponent, anchor);
        i++;
      }
    }
    // 4. 删除两侧多余节点
    // 4.1 删除右侧
    // (a b) c d
    // (a b)
    // i=2 e1=3 e2=1
    // 4.2 删除左侧
    // c d (a b)
    //     (a b)
    // i=0 e1=1 e2=-1
    else if (i > e2) {
      while (i <= e1) {
        hostRemove(c1[i].el);
        i++;
      }
    }
    // 5.处理中间节点
    else {
      // a b (c d e) f g
      // a b (e c d) f g
      const s1 = i;
      const s2 = i;

      // 新节点key到newIndex的映射，在遍历老节点时可以通过key快速查找是否在新列表中存在
      const keyToNewIndexMap = new Map();
      for (let i = s2; i <= e2; i++) {
        keyToNewIndexMap.set(c2[i].key, i);
      }

      // 优化手段：计算出需要patch的数量，每次patch后数量+1，如果patch数量=需要patch的数量后，剩余节点就直接删除
      const toBePatched = e2 - s2 + 1;
      let patched = 0;

      // 优化手段：用来判断是否有需要移动的节点。maxNewIndexSoFar记录最大的递增索引，如果节点的索引一直是递增的，
      // 代表在新列表中依旧是升序的，节点不需要移动。如果某个节点索引<maxNewIndexSoFar,则代表当前节点需要移动
      let moved = false;
      let maxNewIndexSoFar = 0;

      // 新列表节点的索引在旧列表中的索引数组
      const newIndexToOldIndexMap = new Array(toBePatched).fill(0);

      for (let i = s1; i <= e1; i++) {
        const prevChild = c1[i];
        if (patched >= toBePatched) {
          hostRemove(prevChild.el);
          continue;
        }
        // 查找节点在新列表中的索引
        let newIndex;
        if (prevChild.key !== undefined) {
          newIndex = keyToNewIndexMap.get(prevChild.key);
        } else {
          for (let j = s2; j <= e2; j++) {
            if (isSameVNodeType(prevChild, c2[j])) {
              newIndex = j;
              break;
            }
          }
        }
        // 新列表中不存在，移除节点
        if (newIndex === undefined) {
          hostRemove(prevChild.el);
        }
        // 新列表中存在
        else {
          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex;
          } else {
            moved = true;
          }
          // 记录新节点在旧列表中的索引
          newIndexToOldIndexMap[newIndex - s1] = i + 1;
          // patch节点，更新属性等操作
          patch(prevChild, c2[newIndex], container, parentComponent, null);
          patched++;
        }
      }

      // 计算最长递增子序列
      const increasingNewIndexSequence = moved
        ? getSequence(newIndexToOldIndexMap)
        : [];
      let j = increasingNewIndexSequence.length - 1;
      // 倒叙遍历的原因：如果是升序的话，当前节点的锚点是下一个节点，而下一个节点还没处理，是不稳定的（可能会动也可能不会动）。
      // 倒叙遍历的话，后续节点是稳定的，只需要移动或者添加到下一个节点的前面即可。
      for (let i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = s2 + i;
        const nextChild = c2[nextIndex];
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null;
        if (newIndexToOldIndexMap[i] === 0) {
          patch(null, nextChild, container, parentComponent, anchor);
        } else if (moved) {
          // 为什么直接跟j索引对比即可，而不是通过includes来判断是否在序列中
          // increasingNewIndexSequence是newIndexToOldIndexMap的子集，increasingNewIndexSequence的每个元素在newIndexToOldIndexMap中都能找到。
          // 两个数组都是递增，newIndexToOldIndexMap的元素肯定会有一个与j对应的索引时相同的。最终increasingNewIndexSequence元素都会被消费掉，所以不用includes。
          if (j < 0 || i !== increasingNewIndexSequence[j]) {
            hostInsert(nextChild.el, container, anchor);
          } else {
            j--;
          }
        }
      }
    }
  }

  function mountChildren(
    children: any[],
    container: any,
    parentComponent,
    anchor
  ) {
    children.forEach((child) => {
      patch(null, child, container, parentComponent, anchor);
    });
  }
  function unmountChildren(children) {
    children.forEach((child) => {
      hostRemove(child);
    });
  }

  function processComponent(
    n1,
    n2: any,
    container: any,
    parentComponent,
    anchor
  ) {
    if (!n1) {
      mountComponent(n2, container, parentComponent, anchor);
    } else {
      updateComponent(n1, n2);
    }
  }

  function updateComponent(n1, n2) {
    const instance = (n2.component = n1.component);
    if (shouldUpdateComponent(n1, n2)) {
      instance.next = n2;
      instance.update();
    } else {
      n2.el = n1.el;
      instance.vnode = n2;
    }
  }

  function mountComponent(vnode, container, parentComponent, anchor) {
    const instance = (vnode.component = createComponentInstance(
      vnode,
      parentComponent
    ));
    // 初始化组件props、slot、状态、以及render
    setupComponent(instance);
    // 渲染组件模板
    setupRenderEffect(instance, container, anchor);
  }

  function setupRenderEffect(instance, container, anchor) {
    instance.update = effect(
      () => {
        const { proxy, vnode, isMounted } = instance;
        if (!isMounted) {
          console.log("init");
          const subTree = (instance.subTree = instance.render.call(proxy));
          patch(null, subTree, container, instance, anchor);
          vnode.el = subTree.el;
          instance.isMounted = true;
        } else {
          console.log("update");
          const { vnode, next, subTree: prevSubTree } = instance;
          if (next) {
            next.el = vnode.el;
            updateComponentPreRender(instance, next);
          }
          const subTree = instance.render.call(proxy);
          instance.subTree = subTree;
          patch(prevSubTree, subTree, container, instance, anchor);
        }
      },
      {
        scheduler() {
          queueJob(instance.update);
        },
      }
    );
  }
  function updateComponentPreRender(instance, nextVNode) {
    instance.vnode = nextVNode;
    instance.next = null;
    instance.props = nextVNode.props;
  }

  function processFragment(
    n1,
    n2: any,
    container: any,
    parentComponent,
    anchor
  ) {
    mountChildren(n2.children, container, parentComponent, anchor);
  }

  function processText(n1, n2: any, container: any, anchor) {
    const textNode = (n2.el = document.createTextNode(n2.children));
    hostInsert(textNode, container, anchor);
  }

  return {
    createApp: createAppAPI(render),
  };
}

function getSequence(arr: number[]): number[] {
  const p = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = (u + v) >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }
  return result;
}
