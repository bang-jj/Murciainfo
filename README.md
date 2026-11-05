# Murciainfo

Information about Murcia for UCAM exchange students.
給 UCAM Murcia 交換生的生活資訊網站。

網站使用 [Eleventy](https://www.11ty.dev/) 製作：內容寫在簡單的 Markdown 文字檔裡，每次更新 `main` 分支時，GitHub 會自動把網站組合好並發布到 GitHub Pages。

## 檔案放在哪裡

```
src/
├── index.njk            語言選擇首頁
├── zh-tw/               繁體中文頁面
│   ├── index.md         中文首頁（選單會自動產生）
│   ├── basic.md         城市與校園
│   ├── transport.md     交通
│   └── ...
├── en/                  英文頁面（結構同上）
├── images/              圖片
├── assets/style.css     全站共用樣式（顏色、字體）
├── _data/
│   ├── languages.js     支援的語言清單
│   └── i18n.js          按鈕、選單等固定文字的翻譯
└── _includes/layouts/   頁面外框（頁首、頁尾）
```

## 如何修改內容

直接在 GitHub 網站上打開 `src/` 裡的 `.md` 檔，按鉛筆圖示編輯，存檔後網站約 1-2 分鐘會自動更新。

每個頁面最上面 `---` 之間是頁面設定：

```
---
title: 交通運輸          ← 頁面大標題
menuTitle: 交通：電車與巴士 ← 首頁選單上顯示的名稱
icon: 🚌                ← 選單圖示
order: 4                ← 在選單中的順序
subtitle: 一句話介紹      ← 標題下方的灰色小字
---
```

下面就是內容，用 Markdown 寫：

| 寫法 | 效果 |
|---|---|
| `## 標題` | 段落大標題 |
| `### 小標題` | 小標題 |
| `**粗體**` | **粗體** |
| `- 項目` | 項目清單 |
| `1. 項目` | 編號清單 |
| `[文字](https://網址)` | 超連結 |

### 特殊方塊

```
{% card "💡 標題" %}
白色資訊卡的內容
{% endcard %}

{% alert "⚠️ 注意：" %}
紅色提醒框的內容
{% endalert %}

{% alert "⚠️ 注意：", "warning" %}
黃色提醒框的內容
{% endalert %}

{% grid %}
（兩欄排列，裡面放幾個 card）
{% endgrid %}

{% tag "公車 22 路" %}       ← 咖啡色交通標籤
{% tag "需門票", "price" %}   ← 綠色價格標籤

{% figure "../images/圖片.jpg", "圖片說明" %}
```

方塊裡的內容**不要用 4 個以上空格開頭**，否則會被當成程式碼顯示。

## 新增頁面

在語言資料夾裡新增一個 `.md` 檔（例如 `src/zh-tw/courses.md`），寫好上面的頁面設定，它就會自動出現在該語言的首頁選單，網址是 `/zh-tw/courses.html`。

## 新增語言

1. 在 `src/_data/languages.js` 加一行語言設定（阿拉伯文這類由右到左的語言設 `dir: "rtl"`）
2. 在 `src/_data/i18n.js` 加上該語言的按鈕文字
3. 複製 `src/en/` 成新資料夾（例如 `src/ja/`），把 `en.11tydata.json` 改名為 `ja.11tydata.json`，並把裡面的 `"en"` 改成 `"ja"`
4. 翻譯內容，完成後把 `languages.js` 裡的 `ready` 改成 `true`

## 在自己電腦上預覽（選用）

需要先安裝 [Node.js](https://nodejs.org/)，然後：

```
npm install
npm start
```

打開 http://localhost:8080 即可預覽，存檔會自動重新整理。
