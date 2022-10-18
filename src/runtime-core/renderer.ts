import { createComponentInstance, setupComponent } from "./component";
import { isObject } from "../shared/index";

/**
 * 渲染流程
 * 1. render接收vnode，交给patch方法。patch方法为渲染入口，在遇到子vnode时会递归调用，执行渲染逻辑。
 * 2. patch会区分vnode类型，vnode为component交给processConponent，vnode为element交给processElement
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
 */

export function render(vnode, container) {
  patch(vnode, container);
}

function patch(vnode: any, container: any) {
  if (typeof vnode.type === "string") {
    processElement(vnode, container);
  } else if (isObject(vnode.type)) {
    processComponent(vnode, container);
  }
}

function processElement(vnode: any, container: any) {
  mountElement(vnode, container);
}

function mountElement(vnode: any, container: any) {
  const { type, props, children } = vnode;
  const el = document.createElement(type);

  // 处理子节点
  if (typeof children === "string") {
    el.textContent = children;
  } else if (Array.isArray(children)) {
    mountChildren(children, el);
  }

  // 处理props
  for (const key in props) {
    const val = props[key];
    el.setAttribute(key, val);
  }

  // 挂载节点
  container.append(el);
}

function mountChildren(children: any[], container: any) {
  children.forEach((child) => {
    patch(child, container);
  });
}

function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container);
}

function mountComponent(vnode, container) {
  const instance = createComponentInstance(vnode);
  // 初始化组件props、slot、状态、以及render
  setupComponent(instance);
  // 渲染组件模板
  setupRenderEffect(instance, container);
}

function setupRenderEffect(instance, container) {
  const subTree = instance.render();
  patch(subTree, container);
}
