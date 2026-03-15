import type { Metadata } from "next";
import Script from "next/script";
import { Providers } from "@/components/Providers";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "JSON Prism — Format, Validate & Beautify",
  description:
    "A modern, blazing-fast JSON formatter, validator, and beautifier. Validate, minify, diff, search, convert JSON to YAML/XML/CSV, and explore JSON with a collapsible tree view.",
  keywords: [
    "JSON",
    "formatter",
    "validator",
    "beautifier",
    "JSON viewer",
    "JSON editor",
    "JSON to YAML",
    "JSON to XML",
    "JSON diff",
    "online JSON tool",
    "JSON Prism",
  ],
  authors: [{ name: "bright-json" }],
  openGraph: {
    title: "JSON Prism — Format, Validate & Beautify",
    description:
      "A modern, blazing-fast JSON formatter and beautifier. Diff, convert, and explore JSON with a collapsible tree view.",
    type: "website",
    siteName: "JSON Prism",
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON Prism — Format, Validate & Beautify",
    description: "A modern, blazing-fast JSON formatter, diff viewer, and converter.",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const fontUrl =
    "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap";

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to font origins so font CSS and font files start early */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={fontUrl} />
        {/* Prevent flash of unstyled content: apply dark class before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('json-viewer-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WMZSRR3M"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <Providers>
          {children}
          <Toaster />
        </Providers>
        {/* GTM loads after page is interactive to avoid blocking TBT/TTI */}
        <Script
          id="gtm"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-WMZSRR3M');`,
          }}
        />
      </body>
    </html>
  );
}
