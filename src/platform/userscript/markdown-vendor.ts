import { createMarkdownIt, renderMarkdown } from "../../utils/markdown"
;(
  globalThis as typeof globalThis & {
    __OphelMarkdownVendor?: {
      renderMarkdown: typeof renderMarkdown
      createMarkdownIt: typeof createMarkdownIt
    }
  }
).__OphelMarkdownVendor = {
  renderMarkdown,
  createMarkdownIt,
}
