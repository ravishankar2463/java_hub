import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/Navbar";
import { OfflineRoadmapProvider } from "@/components/OfflineRoadmapProvider";
import { getArticles } from "@/lib/markdown";
import { roadmapData } from "@/data/roadmap";
import { slugify } from "@/utils/slugify";
import Link from "next/link";
import { Compass } from "lucide-react";
import { getStaticBasePath } from "@/lib/site-paths.mjs";

const basePath = getStaticBasePath();

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JavaHub | Modern Java Developer Platform",
  description: "The complete senior engineering curriculum: 16 levels, 116 deep-dive topics, JVM internals, Project Loom, Spring Boot 3, Distributed Systems, AI Orchestration, and Ultra-Low Latency Java.",
  icons: {
    icon: `${basePath}/icons/icon-192.png`,
    apple: `${basePath}/icons/apple-touch-icon.png`,
  },
  appleWebApp: {
    capable: true,
    title: "JavaHub",
    statusBarStyle: "default",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const articles = getArticles().map(a => ({
    id: a.slug,
    title: a.frontmatter.title,
    url: `/${a.category || "general"}/${a.slug}`,
    group: "Articles"
  }));

  const roadmapItems = roadmapData.flatMap(level => 
    level.topics.map(topic => ({
      id: slugify(topic.title),
      title: topic.title,
      url: `/roadmap/level-${level.level}/${slugify(topic.title)}`,
      group: `Level ${level.level}: ${level.subtitle}`
    }))
  );

  const searchItems = [...articles, ...roadmapItems];

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[var(--color-background)] text-[var(--color-foreground)]">
        <OfflineRoadmapProvider
          basePath={basePath}
          enabled={process.env.NODE_ENV === "production"}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Navbar searchItems={searchItems} />
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
              {children}
            </main>
            <footer className="w-full border-t border-[var(--color-border)] py-8 px-4 sm:px-6 lg:px-8 mt-auto bg-[var(--color-card)]">
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-semibold text-slate-900 dark:text-slate-100">JavaHub</span>
                  <span>&bull;</span>
                  <span>16 Levels &bull; 116 Roadmap Topics</span>
                </div>
                <div className="flex items-center gap-6">
                  <Link href="/" className="hover:text-foreground transition-colors">
                    Roadmap
                  </Link>
                  <Link href="/about" className="hover:text-foreground transition-colors">
                    About JavaHub
                  </Link>
                </div>
              </div>
            </footer>
          </ThemeProvider>
        </OfflineRoadmapProvider>
      </body>
    </html>
  );
}
