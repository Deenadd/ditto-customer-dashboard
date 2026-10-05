import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ditto — Insurance made simple",
  description:
    "Sign in to Ditto to see your pending applications, active and inactive policies, and help with claims.",
};

/* Edge to edge on iPhones: the page runs under the status bar and home
   indicator, and fixed chrome pads itself with env(safe-area-inset-*). */
export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
