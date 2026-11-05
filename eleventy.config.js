// Eleventy 設定檔：把 src/ 裡的內容組合成網站，輸出到 _site/
// Site configuration: builds everything in src/ into _site/
import markdownIt from "markdown-it";

const md = markdownIt({ html: true, linkify: true, breaks: false });

// 小工具：把方塊裡的內容當作 Markdown 轉成 HTML
const renderInner = (content) => md.render(dedent(content)).trim();

// 移除共同縮排，讓方塊內容就算有縮排也能正確顯示
function dedent(text) {
  const lines = text.replace(/^\n+|\s+$/g, "").split("\n");
  const indents = lines
    .filter((l) => l.trim())
    .map((l) => l.match(/^[ \t]*/)[0].length);
  const min = indents.length ? Math.min(...indents) : 0;
  return lines.map((l) => l.slice(min)).join("\n");
}

const escapeHtml = (s = "") =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

export default function (eleventyConfig) {
  eleventyConfig.setLibrary("md", md);

  // 圖片和樣式直接複製到網站
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/assets");

  // ---------- 內容方塊（在 Markdown 裡使用） ----------

  // 白色資訊卡：{% card "標題" %} 內容 {% endcard %}
  eleventyConfig.addPairedShortcode("card", (content, title) => {
    const heading = title ? `<h3>${title}</h3>` : "";
    return `<div class="card">${heading}${renderInner(content)}</div>`;
  });

  // 提醒框：{% alert "標題" %} 內容 {% endalert %}
  // 黃色提醒：{% alert "標題", "warning" %} 內容 {% endalert %}
  eleventyConfig.addPairedShortcode("alert", (content, title, type = "danger") => {
    const heading = title ? `<p class="alert-title">${title}</p>` : "";
    return `<div class="alert alert-${type}" role="note">${heading}${renderInner(content)}</div>`;
  });

  // 兩欄或三欄排列：{% grid %} ... {% endgrid %}、{% grid 3 %} ... {% endgrid %}
  eleventyConfig.addPairedShortcode("grid", (content, columns = 2) => {
    return `<div class="grid grid-${columns}">${renderInner(content)}</div>`;
  });

  // 小標籤：{% tag "公車 22 路" %}、{% tag "需門票", "price" %}
  eleventyConfig.addShortcode("tag", (text, type = "transport") => {
    return `<span class="tag tag-${type}">${escapeHtml(text)}</span>`;
  });

  // 附說明文字的圖片：{% figure "../images/tranvia.jpg", "說明文字" %}
  eleventyConfig.addShortcode("figure", (src, caption = "") => {
    const cap = caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : "";
    return `<figure><img src="${encodeURI(src)}" alt="${escapeHtml(caption)}" loading="lazy">${cap}</figure>`;
  });

  // ---------- 給版面用的工具 ----------

  // 取得某語言的所有頁面，依 order 排序（首頁選單用）
  eleventyConfig.addFilter("pagesInLang", (pages, lang) =>
    pages
      .filter((p) => p.data.lang === lang && p.page.fileSlug !== lang && !p.data.hideFromMenu)
      .sort((a, b) => (a.data.order ?? 99) - (b.data.order ?? 99))
  );

  // 依語言代碼取得語言資訊
  eleventyConfig.addFilter("findLang", (languages, code) => languages.find((l) => l.code === code));

  // 找出同一頁面的其他語言版本（語言切換用）
  eleventyConfig.addFilter("translationsOf", (pages, page) => {
    const slug = page.filePathStem.split("/").slice(2).join("/");
    return pages.filter(
      (p) => p.data.lang && p.page.filePathStem.split("/").slice(2).join("/") === slug
    );
  });

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
