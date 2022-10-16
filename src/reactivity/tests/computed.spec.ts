import { reactive } from "../reactive";
import { computed } from "../computed";
describe("computed", () => {
  it("happy path", () => {
    const user = reactive({
      age: 1,
    });
    const age = computed(() => {
      return user.age;
    });
    expect(age.value).toBe(1);
  });

  it("should compute lazily", () => {
    const observed = reactive({
      foo: 1,
    });
    const getter = jest.fn(() => {
      return observed.foo;
    });
    const cFoo = computed(getter);
    // lazy
    expect(getter).not.toHaveBeenCalled();
    expect(cFoo.value).toBe(1);
    expect(getter).toBeCalledTimes(1);

    // cache
    cFoo.value;
    expect(getter).toBeCalledTimes(1);

    // 改变依赖的响应式数据，也不会触发计算属性变化
    observed.foo = 2;
    expect(getter).toBeCalledTimes(1);

    // 只有再次访问计算属性的值，才会重新计算
    expect(cFoo.value).toBe(2);
    expect(getter).toBeCalledTimes(2);

    // 再次访问计算属性，只会访问缓存
    cFoo.value;
    expect(getter).toBeCalledTimes(2);
  });
});
