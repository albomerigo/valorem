import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { SwRegister } from "@/components/sw-register";
import { PageTransition } from "@/components/page-transition";
import { TimeTheme } from "@/components/time-theme";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Valorem · Dashboard finanziaria",
  description: "Il tuo coach comportamentale per finanze personali.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Valorem",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#060508" },
    { media: "(prefers-color-scheme: light)", color: "#fafaff" },
  ],
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="it"
      className={`${inter.variable} ${fraunces.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          themes={["light", "dark"]}
          storageKey="valorem-theme"
        >
          <SwRegister />
          <PageTransition />
          <TimeTheme />
          <div className="ambient-bg" />
          <div id="page-content">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}