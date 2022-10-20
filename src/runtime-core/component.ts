import { initProps } from "./componentProps";
import { PublicInstanceProxyHandlers } from "./componentPublicInstance";
import { shallowReadonly } from "../reactivity/reactive";
export function createComponentInstance(vnode) {
  return {
    vnode,
    type: vnode.type,
    setupState: {},
  };
}

export function setupComponent(instance) {
  initProps(instance, instance.vnode.props);
  // initSlots()
  setupStatefulComponent(instance);
}

function setupStatefulComponent(instance: any) {
  instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
  const setup = instance.type.setup;
  if (setup) {
    const setupResult = setup(shallowReadonly(instance.props));
    handleSetupResult(instance, setupResult);
  }
}

function handleSetupResult(instance: any, setupResult: any) {
  if (typeof setupResult === "object") {
    instance.setupState = setupResult;
  }
  finishComponentSetup(instance);
}

function finishComponentSetup(instance: any) {
  const Component = instance.type;
  instance.render = Component.render;
}
