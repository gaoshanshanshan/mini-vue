export * from "@mini-vue/runtime-dom";
import * as runtimeDom from "@mini-vue/runtime-dom";
import { registerCompiler } from "@mini-vue/runtime-dom";
import { baseCompile } from "@mini-vue/compiler-core";

// 包装运行时compiler，将编译后的render包装在函数中，并注入运行时需要的辅助函数
function compileToFunction(template) {
  const { code } = baseCompile(template);
  const render = new Function("Vue", code)(runtimeDom);
  return render;
}

registerCompiler(compileToFunction);
