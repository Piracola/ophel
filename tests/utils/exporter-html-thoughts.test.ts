import { describe, expect, it } from "vitest"

import { formatToHTML, type ExportMessage, type ExportMetadata } from "~utils/exporter"
import { setLanguage } from "~utils/i18n"

const metadata: ExportMetadata = {
  title: "thought test",
  url: "https://example.com",
  exportTime: "2026-01-01 00:00:00",
  source: "Example",
}

const assistant = (content: string): ExportMessage => ({ role: "assistant", content })

describe("formatToHTML theme labels localization", () => {
  it("reflects language changes dynamically in embedded script labels", () => {
    setLanguage("zh-CN")
    const zhHtml = formatToHTML(metadata, [assistant("test")])
    expect(zhHtml).toContain('"auto":"跟随系统"')
    expect(zhHtml).toContain('"light":"浅色"')
    expect(zhHtml).toContain('"dark":"深色"')

    setLanguage("en")
    const enHtml = formatToHTML(metadata, [assistant("test")])
    expect(enHtml).toContain('"auto":"Auto"')
    expect(enHtml).toContain('"light":"Light"')
    expect(enHtml).toContain('"dark":"Dark"')
  })
})

describe("formatToHTML thought grouping", () => {
  it("wraps a thought blockquote in a collapsed details section", () => {
    const html = formatToHTML(metadata, [
      assistant("> [Thoughts]\n> reasoning"),
      assistant("answer"),
    ])

    expect(html).toContain('<details class="gh-thought">')
    expect(html).toContain("<p>reasoning</p>")
  })

  it("merges consecutive segmented thought blocks into one details section", () => {
    const html = formatToHTML(metadata, [
      assistant("> [Thoughts]\n> first\n\n> [Thoughts]\n> second\n\nanswer"),
    ])

    const detailsCount = html.split('<details class="gh-thought">').length - 1
    expect(detailsCount).toBe(1)
    expect(html).toContain("<p>first</p>")
    expect(html).toContain("<p>second</p>")
  })

  it("keeps nested blockquotes inside a thought group without mis-splitting", () => {
    const html = formatToHTML(metadata, [assistant("> [Thoughts]\n> outer\n> > nested\n\nanswer")])

    const detailsCount = html.split('<details class="gh-thought">').length - 1
    expect(detailsCount).toBe(1)
    expect(html).toContain("<p>outer</p>")
    expect(html).toContain("<blockquote>")
    expect(html).toContain("<p>nested</p>")
  })

  it("does not treat HTML tags inside fenced code as blockquotes", () => {
    const html = formatToHTML(metadata, [
      assistant("```html\n<blockquote>not a thought</blockquote>\n```"),
    ])

    expect(html).not.toContain('<details class="gh-thought">')
    expect(html).not.toContain("</blockquote>")
    expect(html).toContain('hljs-name">blockquote')
  })

  it("leaves a plain blockquote untouched", () => {
    const html = formatToHTML(metadata, [assistant("> just a quote")])

    expect(html).not.toContain('<details class="gh-thought">')
    expect(html).toContain("<blockquote>")
    expect(html).toContain("<p>just a quote</p>")
  })
})
