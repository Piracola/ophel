import { platform } from "~platform"

/**
 * KaTeX CSS 样式文本。
 *
 * 样式通过平台抽象按需加载：扩展端依赖 Plasmo 的 raw:/url: 构建资源，
 * 在 platform.math.getKatexStylesText 内部动态导入，测试与 markdown 管线
 * 不会在模块加载阶段触碰这些协议。
 */
export const getMathStyles = (): Promise<string> => platform.math.getKatexStylesText()
