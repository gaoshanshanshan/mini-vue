import { reactive, readonly } from '../reactive';
describe("readonly", () => {
  it("happy path", () => {
    const original = { foo: 1 };
    const obj = readonly(original);
    expect(obj).not.toBe(original);
    expect(obj.foo).toBe(1);
  });

  it("wran when call set", () => {
    console.warn = jest.fn();
    const obj = readonly({ foo: 1 });
    obj.foo++
    expect(console.warn).toBeCalled()
  });
});
