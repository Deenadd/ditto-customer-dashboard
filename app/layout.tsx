import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TapHaptics } from "@/components/ui/tap-haptics";
import { Toaster } from "@/components/ui/toast";

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
   indicator, and fixed chrome pads itself with env(safe-area-inset-*).
   On Android the keyboard shrinks the layout, as it does on iOS, so a
   composer pinned to the bottom of a sheet stays above it. */
export const viewport: Viewport = {
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        {/* The first stop for the keyboard: past the header, straight to the
            page. Every page's <main> is #main. Off screen until focused. */}
        <a
          href="#main"
          className="fixed top-[calc(env(safe-area-inset-top)+8px)] left-3 z-[60] inline-flex h-11 -translate-y-[calc(100%+80px)] items-center rounded-control bg-accent px-4 text-[15px] font-medium text-white shadow-accent transition-transform duration-150 ease-out focus-visible:translate-y-0"
        >
          Skip to content
        </a>
        {children}
        <TapHaptics />
        <Toaster />
      </body>
    </html>
  );
}
