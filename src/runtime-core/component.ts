import { PublicInstanceProxyHandlers } from "./componentPublicInstance";
export function createComponentInstance(vnode) {
  return {
    vnode,
    type: vnode.type,
    setupState: {},
  };
}

export function setupComponent(instance) {
  // initProps()
  // initSlots()
  setupStatefulComponent(instance);
}

function setupStatefulComponent(instance: any) {
  instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
  const setup = instance.type.setup;
  if (setup) {
    const setupResult = setup();
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
