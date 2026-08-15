import "./globals.css";

export const metadata = {
  title: "Travel Policy RAG Chatbot｜差旅規章 AI 助理",
  description: "依據《員工差旅管理辦法》與《差旅常見問題FAQ》回答的內部差旅問答機器人",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
