import { effect } from "../src/effect";
import { isRef, proxyRef, ref, unRef } from "../src/ref";

describe("ref", () => {
  it("happy path", () => {
    const a = ref(1);
    expect(a.value).toBe(1);
  });

  it("should be reactive", () => {
    const a = ref(1);
    let dummy;
    let calls = 0;
    effect(() => {
      calls++;
      dummy = a.value;
    });
    expect(dummy).toBe(1);
    expect(calls).toBe(1);
    a.value = 2;
    expect(dummy).toBe(2);
    expect(calls).toBe(2);
    a.value = 2;
    expect(dummy).toBe(2);
    expect(calls).toBe(2);
  });

  it("should make nested properties reactive", () => {
    let dummy;
    const a = ref({
      count: 1,
    });
    effect(() => {
      dummy = a.value.count;
    });
    expect(dummy).toBe(1);
    a.value.count = 2;
    expect(dummy).toBe(2);
  });

  it("isRef", () => {
    const a = ref(1);
    expect(isRef(a)).toBe(true);
    expect(isRef(1)).toBe(false);
  });

  it("unRef", () => {
    const a = ref(1);
    expect(unRef(a)).toBe(1);
    expect(unRef(1)).toBe(1);
  });

  it("proxyRef", () => {
    const user = {
      age: ref(10),
      name: "xiaoming",
    };
    const proxyUser = proxyRef(user);
    expect(user.age.value).toBe(10);
    expect(proxyUser.age).toBe(10);
    expect(proxyUser.name).toBe("xiaoming");

    proxyUser.age = 20;
    expect(user.age.value).toBe(20);
    expect(proxyUser.age).toBe(20);

    proxyUser.age = ref(10);
    expect(user.age.value).toBe(10);
    expect(proxyUser.age).toBe(10);
  });
});