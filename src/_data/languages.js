// 網站支援的語言清單（依此順序顯示）
// ready: true  → 顯示在首頁，可以點進去
// ready: false → 首頁顯示「準備中」
// dir: "rtl"   → 由右到左的語言（例如阿拉伯文）
export default [
  { code: "zh-tw", htmlLang: "zh-Hant", name: "繁體中文", english: "Chinese", dir: "ltr", ready: true },
  { code: "en", htmlLang: "en", name: "English", english: "English", dir: "ltr", ready: true },
  { code: "es", htmlLang: "es", name: "Español", english: "Spanish", dir: "ltr", ready: true },
  { code: "ja", htmlLang: "ja", name: "日本語", english: "Japanese", dir: "ltr", ready: true },
  { code: "ko", htmlLang: "ko", name: "한국어", english: "Korean", dir: "ltr", ready: true },
  { code: "fr", htmlLang: "fr", name: "Français", english: "French", dir: "ltr", ready: true },
  { code: "ar", htmlLang: "ar", name: "العربية", english: "Arabic", dir: "rtl", ready: true },
  { code: "pl", htmlLang: "pl", name: "Polski", english: "Polish", dir: "ltr", ready: true },
  { code: "cs", htmlLang: "cs", name: "Čeština", english: "Czech", dir: "ltr", ready: false },
];
