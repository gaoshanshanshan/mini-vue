import { effect } from "../effect";
import { reactive } from "../reactive";

describe("effect", () => {
  
  it("happy path", () => {
    const user = reactive({ age: 10 });
    let nextAge;
    effect(() => {
      nextAge = user.age + 1;
    });
    expect(nextAge).toBe(11);
    user.age++;
    expect(nextAge).toBe(12);
  });

  it("should return runner when call effect", () => {
    let num = 10;
    const runner = effect(() => {
      num++;
      return "foo";
    });
    expect(num).toBe(11);
    const result = runner();
    expect(num).toBe(12);
    expect(result).toBe("foo");
  });
});
