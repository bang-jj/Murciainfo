// Eleventy 設定檔：把 src/ 裡的內容組合成網站，輸出到 _site/
// Site configuration: builds everything in src/ into _site/
import markdownIt from "markdown-it";
import fs from "node:fs";
import path from "node:path";

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

  // 把頁面裡的圖片路徑（例如 ../images/x.jpg）對應到 src/images/x.jpg
  const imageFile = (src) => path.join("src", src.replace(/^(\.\.\/)+/, ""));

  // 照片來源與授權（src/_data/photoCredits.json）
  const credits = () => {
    try { return JSON.parse(fs.readFileSync("src/_data/photoCredits.json", "utf8")); } catch { return {}; }
  };
  const creditLine = (src) => {
    const c = credits()[path.basename(src)];
    if (!c) return "";
    const who = c.url ? `<a href="${escapeHtml(c.url)}" target="_blank" rel="noopener">${escapeHtml(c.author)}</a>` : escapeHtml(c.author);
    return `<span class="credit">📷 ${who}${c.license ? ` · ${escapeHtml(c.license)}` : ""}</span>`;
  };

  // 附說明文字的圖片：{% figure "../images/tranvia.jpg", "說明文字" %}
  // 圖片檔不存在時不顯示（避免出現破圖）
  eleventyConfig.addShortcode("figure", (src, caption = "") => {
    if (!fs.existsSync(imageFile(src))) {
      console.warn(`[figure] 找不到圖片，略過：${src}`);
      return "";
    }
    const credit = creditLine(src);
    const cap = caption || credit ? `<figcaption>${escapeHtml(caption)}${credit}</figcaption>` : "";
    return `<figure><img src="${encodeURI(src)}" alt="${escapeHtml(caption)}" loading="lazy">${cap}</figure>`;
  });

  // 大張的步驟截圖：{% shot "../images/steps/la-1.png", "第 1 步：……" %}
  eleventyConfig.addShortcode("shot", (src, caption = "") => {
    if (!fs.existsSync(imageFile(src))) {
      console.warn(`[shot] 找不到截圖，略過：${src}`);
      return "";
    }
    const cap = caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : "";
    return `<figure class="shot"><a href="${encodeURI(src)}" target="_blank"><img src="${encodeURI(src)}" alt="${escapeHtml(caption)}" loading="lazy"></a>${cap}</figure>`;
  });

  // App 介紹卡：{% app "Trainline", "trainline", "https://..." %} 說明 {% endapp %}
  // 圖示放在 src/images/apps/trainline.png（沒有圖示時顯示首字母）
  eleventyConfig.addPairedShortcode("app", (content, name, icon, url = "") => {
    const file = ["png", "jpg", "webp"].map((e) => `src/images/apps/${icon}.${e}`).find((f) => fs.existsSync(f));
    const img = file
      ? `<img class="app-icon" src="../images/apps/${path.basename(file)}" alt="" loading="lazy">`
      : `<span class="app-icon app-icon-fallback" aria-hidden="true">${escapeHtml(name.slice(0, 1))}</span>`;
    const title = url
      ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(name)}</a>`
      : escapeHtml(name);
    return `<div class="card app-card"><div class="app-head">${img}<h3>${title}</h3></div>${renderInner(content)}</div>`;
  });

  // Google 地圖：{% map "Hello Asia Murcia", "在 Google 地圖開啟" %}
  eleventyConfig.addShortcode("map", (query, linkText = "Google Maps") => {
    const q = encodeURIComponent(query);
    return `<figure class="map"><iframe src="https://www.google.com/maps?q=${q}&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="${escapeHtml(query)}"></iframe><figcaption><a href="https://www.google.com/maps/search/?api=1&query=${q}" target="_blank" rel="noopener">📍 ${escapeHtml(linkText)}</a></figcaption></figure>`;
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
  eleventyConfig.addFilter("translationsOf", (pages, page, languages = []) => {
    const slug = page.filePathStem.split("/").slice(2).join("/");
    const rank = (code) => languages.findIndex((l) => l.code === code);
    return pages
      .filter((p) => p.data.lang && p.page.filePathStem.split("/").slice(2).join("/") === slug)
      .sort((a, b) => rank(a.data.lang) - rank(b.data.lang));
  });

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
