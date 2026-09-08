import type { Metadata } from "next";
import { Cormorant_Garamond, Geist_Mono, Outfit } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import { Toaster } from "@/components/ui/sonner";
import { WardrobeProvider } from "@/context/wardrobe-context";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Atelier — Digital Wardrobe",
  description: "A private women's wardrobe for pieces, looks, and favorites.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${cormorant.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light">
          <WardrobeProvider>
            <AppShell>{children}</AppShell>
            <Toaster theme="light" />
          </WardrobeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
