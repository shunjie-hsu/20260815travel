# Travel Policy RAG Chatbot｜差旅規章 AI 助理

依據《員工差旅管理辦法（2026年版）》與《差旅常見問題FAQ（2025年版）》兩份文件回答員工差旅問題的內部聊天機器人。

- 每個回答都會標註來源，格式如：`〔來源：員工差旅管理辦法 2026年版 第二條〕`
- 只依據這兩份文件回答，資料庫沒有的規定一律回「本資料庫無此項規定」
- 兩份文件不一致時，會主動指出差異，並以《員工差旅管理辦法》為準，FAQ 內容註明僅供參考
- 支援多輪對話（會記住同一次對話中的前後文）
- 完全公開使用，不需要密碼
- Gemini API Key 只存在伺服器端環境變數，前端與瀏覽器完全看不到

技術棧：Next.js（App Router） + Gemini API（`gemini-2.0-flash`），可直接部署在 Vercel。

---

## 一、本機開發

```bash
# 1. 安裝套件
npm install

# 2. 設定 API Key
cp .env.example .env.local
# 打開 .env.local，把 GEMINI_API_KEY 換成你自己的 Gemini API Key

# 3. 啟動開發伺服器
npm run dev
```

打開 http://localhost:3000 即可測試。

---

## 二、部署到 GitHub + Vercel

### Step 1：把專案推上 GitHub

```bash
git init
git add .
git commit -m "init: Travel Policy RAG Chatbot"
git branch -M main
git remote add origin https://github.com/<你的帳號>/<repo名稱>.git
git push -u origin main
```

### Step 2：到 Vercel 匯入專案

1. 登入 https://vercel.com ，選擇 **Add New → Project**
2. 選擇剛剛推上去的 GitHub repository，Import
3. Framework Preset 會自動偵測為 **Next.js**，不需要更改 Build/Output 設定
4. 在 **Environment Variables** 區塊新增：
   - Key：`GEMINI_API_KEY`
   - Value：你的 Gemini API Key
   - Environment：勾選 Production（建議也勾 Preview）
5. 按下 **Deploy**，等待部署完成即可拿到一組 `xxx.vercel.app` 網址，公開給所有人使用

之後只要 `git push` 到 GitHub，Vercel 就會自動重新部署。

---

## 三、如何更新文件內容 / 之後換版本

**不需要改任何程式碼**，只要修改：

- `data/policy.json` → 對應《員工差旅管理辦法》
- `data/faq.json` → 對應《差旅常見問題FAQ》

每一份都是這樣的結構：

```json
{
  "title": "文件名稱",
  "version": "版本標示（會顯示給使用者、也會用在來源標註裡）",
  "document_type": "文件類型",
  "effective_date": "生效或文件日期",
  "authority": "文字說明此文件效力高低",
  "citation_label": "來源標註要用的簡稱",
  "sections": [
    {
      "article_no": "第X條 / 第X題",
      "article_name": "條文/題目名稱",
      "topic": ["關鍵字1", "關鍵字2"],
      "content": "條文內容全文"
    }
  ]
}
```

改完存檔、`git push` 後，Vercel 會自動重新部署，機器人的回答內容與引用來源就會跟著更新。

> 若未來要再新增第三份文件（例如另一個部門的差旅規定），可以在 `data/` 底下新增一個 JSON 檔，並在 `lib/knowledgeBase.js` 的 `buildKnowledgeBaseText()` 裡把它一併組進知識庫文字即可。

---

## 四、專案結構

```
app/
  api/chat/route.js   ← 後端 API，呼叫 Gemini（Key 存在伺服器環境變數）
  page.js             ← 聊天介面（前端，多輪對話，含簡易Markdown排版）
  layout.js
  globals.css
data/
  policy.json          ← 員工差旅管理辦法 2026年版（結構化知識庫）
  faq.json             ← 差旅常見問題FAQ 2025年版（結構化知識庫）
lib/
  knowledgeBase.js      ← 把兩份JSON組成給Gemini的系統提示詞（含引用規則、衝突處理規則）
```

---

## 五、注意事項

- 目前是「完全公開、任何人都能用」，因此請留意 Gemini API 的用量與費用；若之後想再加使用限制（例如簡單密碼保護、每日提問次數上限），可以再回來加。
- 若 Gemini 回覆內容中出現的來源標註格式跟預期不同，多半是模型沒有完全照著系統提示詞的規則走，可以在 `lib/knowledgeBase.js` 裡把規則寫得更嚴格，或是把 `temperature` 調低（目前已設為 0.2）。
- 回覆內容支援簡易 Markdown（`## 標題`、`- 條列`、`**粗體**`），前端會自動排版；若模型輸出了不支援的語法（例如表格），會直接以純文字顯示，屬正常現象。
