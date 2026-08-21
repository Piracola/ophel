import katex from "katex"

export type KatexRenderOptions = {
  displayMode: boolean
}

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")

const wrapKatexResult = (latex: string, rendered: string, displayMode: boolean): string => {
  const className = displayMode ? "math-block gh-rendered-math" : "math-inline gh-rendered-math"
  const tagName = displayMode ? "div" : "span"

  return `<${tagName} class="${className}" data-math="${escapeHtml(latex)}">${rendered}</${tagName}>`
}

export const renderKatexToString = (
  content: string,
  { displayMode }: KatexRenderOptions,
): string => {
  const latex = content.replace(/\r\n?/g, "\n").trim()

  try {
    const rendered = katex.renderToString(latex, {
      displayMode,
      output: "htmlAndMathml",
      throwOnError: false,
      strict: "ignore",
      trust: false,
    })
    return wrapKatexResult(latex, rendered, displayMode)
  } catch {
    const fallback = displayMode ? `$$\n${latex}\n$$` : `$${latex}$`
    return wrapKatexResult(latex, `<code>${escapeHtml(fallback)}</code>`, displayMode)
  }
}

/**
 * 渲染为纯 MathML（无字体依赖，适合自包含的导出文档）
 */
export const renderKatexToMathML = (
  content: string,
  { displayMode }: KatexRenderOptions,
): string => {
  const latex = content.replace(/\r\n?/g, "\n").trim()

  try {
    const rendered = katex.renderToString(latex, {
      displayMode,
      output: "mathml",
      throwOnError: false,
      strict: "ignore",
      trust: false,
    })
    return wrapKatexResult(latex, rendered, displayMode)
  } catch {
    return wrapKatexResult(latex, `<math><mtext>${escapeHtml(latex)}</mtext></math>`, displayMode)
  }
}
