import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CommandPalette } from "@/components/command-palette";
import siteConfig from "../../data/site-config.json";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: siteConfig.seo_defaults.title || siteConfig.site_title,
  description: siteConfig.seo_defaults.description || siteConfig.site_subtitle,
  keywords: siteConfig.seo_defaults.keywords,
  openGraph: {
    title: siteConfig.seo_defaults.title,
    description: siteConfig.seo_defaults.description,
    images: [{ url: siteConfig.seo_defaults.og_image }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.seo_defaults.title,
    description: siteConfig.seo_defaults.description,
    images: [siteConfig.seo_defaults.og_image],
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-300 font-sans">
        <Providers>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
          <CommandPalette />
        </Providers>
      </body>
    </html>
  );
}
