import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Axem",
  description: "A Markdown-based exam preparation renderer",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
