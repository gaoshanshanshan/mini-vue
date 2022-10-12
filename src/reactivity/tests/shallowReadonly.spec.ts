import { shallowReadonly, isReadonly } from "../reactive";
describe("shallowReadonly", () => {
  it("happy path", () => {
    const original = { foo: 1, bar: { baz: 2 } };
    const obj = shallowReadonly(original);
    expect(isReadonly(obj)).toBe(true);
    expect(isReadonly(obj.bar)).toBe(false);
  });

  it("wran when call set", () => {
    console.warn = jest.fn();
    const obj = shallowReadonly({ foo: 1 });
    obj.foo++;
    expect(console.warn).toBeCalled();
  });
});
