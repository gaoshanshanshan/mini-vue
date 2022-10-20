export const extend = Object.assign;

export const isObject = (val) => val !== null && typeof val === "object";

export const hasChanged = (val, newVal) => !Object.is(val, newVal);

export const hasOwn = (val, key) =>
  Object.prototype.hasOwnProperty.call(val, key);

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export const camelize = (str: string) =>
  str.replace(/-(\w)/g, (_, c: string) => {
    return c ? c.toUpperCase() : "";
  });

export const toHandlerKey = (str: string) => {
  return str ? "on" + capitalize(str) : "";
};
