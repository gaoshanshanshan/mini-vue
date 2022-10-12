import { shallowReactive, isReactive } from "../reactive";
describe("shallowReactive", () => {
  it("happy path", () => {
    const original = { foo: 1, bar: { baz: 2 } };
    const obj = shallowReactive(original);
    expect(isReactive(obj)).toBe(true);
    expect(isReactive(obj.bar)).toBe(false);
  });

  test('should not make non-reactive properties reactive', () => {
    const props = shallowReactive({ n: { foo: 1 } })
    expect(isReactive(props.n)).toBe(false)
  })
});
