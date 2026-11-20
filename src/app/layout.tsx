import type { Metadata, Viewport } from "next";
import "katex/dist/katex.min.css";
import "./globals.css";
import { RegisterSW } from "@/components/RegisterSW";
import { I18nProvider } from "@/lib/i18n";
import id from "@/locales/id.json";

// Metadata and the manifest are rendered on the server, so they follow the
// default language; everything inside the app switches live.
export const metadata: Metadata = {
  title: id.meta.title,
  description: id.meta.description,
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf9" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0a09" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var d=document.documentElement,t=localStorage.getItem("axem:theme");d.dataset.theme=t==="light"||t==="dark"?t:window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";var s=localStorage.getItem("axem:style");if(s==="minimal"||s==="reading"||s==="brutal")d.dataset.style=s;d.lang=localStorage.getItem("axem:lang")==="en"?"en":"id"}catch(e){}`,
          }}
        />
      </head>
      <body>
        <I18nProvider>{children}</I18nProvider>
        <RegisterSW />
      </body>
    </html>
  );
}
