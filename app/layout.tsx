import type { Metadata } from "next";
import { Geist, Inter } from "next/font/google";
import "@/registry/foundation.css";
import "./globals.css";

/* Arc's faces: Geist for display headings, Inter for everything else. */
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ditto: insurance, made simple",
  description:
    "Sign in to Ditto to see your pending applications, active and inactive policies, and help with claims.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-accent="blue" className={`${geist.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
