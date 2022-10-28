import { createComponentInstance, setupComponent } from "./component";
import { ShapeFlags } from "../shared/ShapeFlags";
import { Fragment, Text } from "./vnode";
import { createAppAPI } from "./createApp";
import { effect } from "../reactivity";

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
  const { createElement, patchProp, insert } = options;

  function render(vnode, container) {
    patch(null, vnode, container, null);
  }

  function patch(n1, n2: any, container: any, parentComponent) {
    const { type } = n2;
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent);
        break;
      case Text:
        processText(n1, n2, container);
        break;
      default:
        const { shapeFlag } = n2;
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent);
        }
        break;
    }
  }

  function processElement(n1, n2: any, container: any, parentComponent) {
    if (!n1) {
      mountElement(n2, container, parentComponent);
    } else {
      updateElement(n1, n2, container);
    }
  }

  function mountElement(vnode: any, container: any, parentComponent) {
    const { type, props, children, shapeFlag } = vnode;
    const el = (vnode.el = createElement(type));

    // 处理子节点
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el, parentComponent);
    }

    // 处理props
    for (const key in props) {
      const val = props[key];
      patchProp(el, key, val);
    }

    // 挂载节点
    insert(el, container);
  }

  function updateElement(n1: any, n2: any, container: any) {
    console.log("n1", n1);
    console.log("n2", n2);
  }

  function mountChildren(children: any[], container: any, parentComponent) {
    children.forEach((child) => {
      patch(null, child, container, parentComponent);
    });
  }

  function processComponent(n1, n2: any, container: any, parentComponent) {
    mountComponent(n2, container, parentComponent);
  }

  function mountComponent(vnode, container, parentComponent) {
    const instance = createComponentInstance(vnode, parentComponent);
    // 初始化组件props、slot、状态、以及render
    setupComponent(instance);
    // 渲染组件模板
    setupRenderEffect(instance, container);
  }

  function setupRenderEffect(instance, container) {
    effect(() => {
      const { proxy, vnode, isMounted } = instance;
      if (!isMounted) {
        console.log("init");
        const subTree = (instance.subTree = instance.render.call(proxy));
        patch(null, subTree, container, instance);
        vnode.el = subTree.el;
        instance.isMounted = true;
      } else {
        console.log("update");
        const { subTree: prevSubTree } = instance;
        const subTree = instance.render.call(proxy);
        instance.subTree = subTree;
        patch(prevSubTree, subTree, container, instance);
      }
    });
  }

  function processFragment(n1, n2: any, container: any, parentComponent) {
    mountChildren(n2.children, container, parentComponent);
  }

  function processText(n1, n2: any, container: any) {
    const textNode = (n2.el = document.createTextNode(n2.children));
    insert(textNode, container);
  }

  return {
    createApp: createAppAPI(render),
  };
}
