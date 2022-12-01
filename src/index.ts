export * from "./reactivity";
export * from "./runtime-dom";
import * as runtimeDom from "./runtime-dom";
import { registerCompiler } from "./runtime-dom";
import { baseCompile } from "./compiler-core";

// 包装运行时compiler，将编译后的render包装在函数中，并注入运行时需要的辅助函数
function compileToFunction(template) {
  const { code } = baseCompile(template);
  const render = new Function("Vue", code)(runtimeDom);
  return render;
}

registerCompiler(compileToFunction);
