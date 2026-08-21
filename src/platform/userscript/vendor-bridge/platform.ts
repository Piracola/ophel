import { renderKatexToMathML, renderKatexToString } from "../katex"

import type { Platform } from "../../types"

/**
 * markdown vendor 独立构建使用的最小平台实现。
 *
 * markdown 渲染管线只依赖 platform.math；完整平台实现会引入
 * storage / remoteConfig / i18n 等无关状态模块，不适合打进
 * 经 @require 加载的 markdown vendor，因此这里只暴露 math 能力。
 */
export const platform: Pick<Platform, "math"> = {
  math: {
    renderKatexToString,
    renderKatexToMathML,
    // markdown vendor 不注入 KaTeX CSS，按需返回空样式即可
    async getKatexStylesText() {
      return ""
    },
  },
}
