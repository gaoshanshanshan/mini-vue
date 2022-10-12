import { reactive, isReactive, isProxy } from '../reactive';
describe("reactive", () => {
  it("happy path", () => {
    const original = { foo: 1 };
    const observed = reactive(original);
    expect(original).not.toBe(observed);
    expect(observed.foo).toBe(1);
    expect(isReactive(observed)).toBe(true);
    expect(isReactive(original)).toBe(false);
    expect(isProxy(original)).toBe(false);
    expect(isProxy(observed)).toBe(true);
  });

  it("nested reactive", () => {
    const original = {
      nested: {
        foo: 1,
      },
      array: [{ bar: 1 }],
    };
    const obj = reactive(original);
    expect(isReactive(obj.nested)).toBe(true);
    expect(isReactive(obj.array)).toBe(true);
    expect(isReactive(obj.array[0])).toBe(true);
  });
});
