# 介紹

用 React + Vite 建置個人周邊（小卡、應援物...）整理櫃
輕鬆一覽你所有周邊小物，另外支援文字搜尋、以圖找圖搜尋功能，避免一買再買ＸＤ

## 開始使用

```bash
npm install
npm run dev
```

啟動後打開終端機顯示的網址（預設 http://localhost:5173）即可使用。

打包成正式版：

```bash
npm run build
```

輸出檔案會在 `dist/` 資料夾。

## 專案結構

```
src/
  main.jsx              進入點
  App.jsx                主要邏輯（讀取/新增/刪除/篩選）
  App.css                全站樣式（木質展示櫃主題）
  constants.js            共用常數（storage key、標籤名稱）
  storage.js              資料持久化封裝（目前用 localStorage）
  utils/
    image.js               圖片壓縮（上傳前自動縮小、轉 JPEG）
    format.js               日期格式化
    phash.js                圖片感知雜湊（拍照搜尋的相似度比對）
  components/
    Header.jsx              標題列
    Toolbar.jsx              搜尋框 + 新增按鈕
    TabBar.jsx               標籤分類 tab
    Cabinet.jsx              收藏格網格 + 空狀態
    ItemCard.jsx             單一收藏卡片（含刪除確認）
    AddModal.jsx             新增周邊的表單彈窗
```

## 資料處理

資料存於 localstorage ，如有轉換裝置需求可以使用匯入匯出功能來同步。
