import { reactive, readonly, isReadonly, isProxy } from '../reactive';
describe("readonly", () => {
  it("happy path", () => {
    const original = { foo: 1, bar: { baz: 2 } };
    const obj = readonly(original);
    expect(obj).not.toBe(original);
    expect(obj.foo).toBe(1);
    expect(isReadonly(obj)).toBe(true);
    expect(isReadonly(original)).toBe(false);
    expect(isReadonly(obj.bar)).toBe(true);
    expect(isProxy(obj)).toBe(true);
    expect(isProxy(original)).toBe(false);
  });

  it("wran when call set", () => {
    console.warn = jest.fn();
    const obj = readonly({ foo: 1 });
    obj.foo++;
    expect(console.warn).toBeCalled();
  });
});
