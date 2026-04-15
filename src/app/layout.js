import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "DramaBox — Streaming Drama",
  description:
    "Platform streaming drama dengan pencarian, daftar episode, dan pemutar video multi-resolusi.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Navbar />
        <main className="flex-1">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
        <footer className="border-t border-border/70 bg-surface/20">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 text-sm text-muted sm:px-6 lg:px-8">
            DramaBox — dibuat dengan Next.js
          </div>
        </footer>
      </body>
    </html>
  );
}
