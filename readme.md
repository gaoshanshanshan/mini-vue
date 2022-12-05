## 介绍
实现最核心的vue3功能，用于深入学习vue3

## 功能列表
### reactivity
    - reactive
    - ref
    - computed
    - readonly
    - effect
    - effect.scheduler
    - effect.stop
### runtime-core
    - element渲染
    - 组件渲染
    - diff实现
    - setup支持props和context
    - 支持emit
    - 支持slots
    - nextTick
    - provide和inject
    - watchEffect
### runtime-dom
    - 支持custom render
### compiler core
    - 解析文本
    - 解析插值
    - 解析element
    - 生成render函数
## 使用方式
1. `pnpm run build` 打包
2. 进入`packages/vue/examples`打开`index.html`预览