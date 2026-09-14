# Repository Guidelines

## Project Structure & Module Organization

本專案是一個零第三方依賴的 Node.js 轉換工具，用來將 Anki 風格的問答文字檔產生為互動式 QA HTML。

- `source/`：輸入資料，每個 `DayN.txt` 或 `.tsv` 以 Tab 分隔「問題」與「答案」。
- `html/`：轉換後的每日互動頁面，例如 `html/Day1.html`。
- `index.html`：轉換時重建的總目錄頁，連結到 `html/*.html`。
- `convert.js`：主要轉換腳本，包含解析、HTML 樣板與索引頁生成邏輯。
- `convert.bat`：Windows 使用者的一鍵執行入口。

## Build, Test, and Development Commands

- `npm start`：執行 `convert.js`，讀取 `source/` 並產出 `html/` 與 `index.html`。
- `npm run build`：同上，適合在交付前重建輸出檔。
- `node --preserve-symlinks-main convert.js`：不透過 npm 直接執行轉換。
- `convert.bat`：在 Windows 檔案總管雙擊執行，結束後會停留顯示結果。

目前沒有安裝測試框架；驗證時請至少執行 `npm run build`，並用瀏覽器開啟 `index.html` 檢查導覽與翻卡功能。

## Coding Style & Naming Conventions

JavaScript 使用 ES module 語法、2 空格縮排、雙引號字串，並優先沿用 `convert.js` 既有函式式結構。常數採 `UPPER_SNAKE_CASE`，一般函式使用 `camelCase`，每日來源檔建議使用 `Day1.txt`、`Day2.txt` 這類可排序命名。新增內容時避免引入套件，除非能明確降低維護成本。

## Testing Guidelines

來源檔每行應包含至少一個 Tab：`問題<Tab>答案`。修改解析或輸出樣板後，請用小型測試資料重跑轉換，確認空行會被忽略、多 Tab 答案仍能保留，且瀏覽器 Console 無錯誤。若新增自動化測試，建議放在 `tests/`，命名為 `*.test.js`。

## Commit & Pull Request Guidelines

Git 記錄目前採 Conventional Commit 風格，例如 `feat: initialize ...`。後續提交請使用 `feat:`、`fix:`、`docs:`、`chore:` 等前綴，訊息保持具體。PR 應說明變更目的、列出驗證指令與結果；若調整 HTML/CSS 介面，附上主要畫面截圖或描述瀏覽器檢查結果。

## Agent-Specific Instructions

不要覆寫使用者未要求變更的產出檔。編輯前先確認 `AGENTS.md` 是否已存在；若已存在，停止並回報。處理中文檔案時保持 UTF-8，必要時在 PowerShell 設定 `PYTHONUTF8=1` 後再執行驗證工具。
