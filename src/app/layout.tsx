import type { Metadata } from "next";
import { Newsreader, Manrope, DM_Mono } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import { PreferencesProvider } from "@/components/preferences/PreferencesProvider";
import { THEME_BOOTSTRAP_SCRIPT } from "@/lib/preferences/bootstrap";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "JEROME",
  description: "AI-powered learning platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${newsreader.variable} ${manrope.variable} ${dmMono.variable}`}
    >
      <body className="font-sans antialiased">
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />
        <PreferencesProvider>{children}</PreferencesProvider>
      </body>
    </html>
  );
}
