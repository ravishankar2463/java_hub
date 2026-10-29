import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/Navbar";
import { getArticles } from "@/lib/markdown";
import { roadmapData } from "@/data/roadmap";
import { slugify } from "@/utils/slugify";
import Link from "next/link";
import { Compass } from "lucide-react";

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
  description: "The complete senior engineering curriculum: 11 levels, 73 deep-dive topics, JVM internals, Project Loom, Spring Boot 3, and Cloud Architecture.",
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
                <span>11 Levels &bull; 73 Deep-Dive Architecture Lessons</span>
              </div>
              <div className="flex items-center gap-6">
                <Link href="/" className="hover:text-foreground transition-colors">
                  Home
                </Link>
                <Link href="/roadmap" className="hover:text-foreground transition-colors">
                  Mastery Roadmap
                </Link>
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
