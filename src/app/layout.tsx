import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "こつこつ",
  description: "日々の不安度や気持ちを記録・振り返りするアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full flex flex-col font-sans antialiased">{children}</body>
    </html>
  );
}
