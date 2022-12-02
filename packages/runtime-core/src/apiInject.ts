/**
 * 依赖注入实现原理
 * 1. provide将数据保存在组件实例的provides属性中，供后代组件注入
 *    1.1 当前组件没有通过provide注入数据：当前组件实例的provides会指向父组件的provides，
 *    因为当后代组件注入属性时，由于当前组件没有提供数据，应该直接跳过当前组件的provides，去当前组件的父组件继续查找。类似于原型链查找。
 *    1.2 当前组件实例通过provide注入数据：当前组件的实例的provides应是父组件的provides的子实例（通过Object.create创建父子关系），
 *    因为当后代组件注入属性时，会在当前实例的provides查找，找不到时会沿着provides的原型链向上查找。
 * 2. inject会在父组件的provides中注入需要的数据 
 */
import { getCurrentInstance } from "./component";

export function provide(key, value) {
  const instance: any = getCurrentInstance();
  if (instance) {
    let { provides, parent } = instance;
    if (provides === parent.provides) {
      provides = instance.provides = Object.create(parent.provides);
    }
    provides[key] = value;
  }
}

export function inject(key, defaultValue) {
  const instance: any = getCurrentInstance();
  if (instance) {
    const { provides } = instance.parent;
    if (key in provides) {
      return provides[key];
    } else if (defaultValue) {
      if (typeof defaultValue === "function") {
        return defaultValue();
      } else {
        return defaultValue;
      }
    }
  }
}
