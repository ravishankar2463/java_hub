import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/Navbar";
import { getArticles } from "@/lib/markdown";
import { roadmapData } from "@/data/roadmap";
import { slugify } from "@/utils/slugify";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Java Developer Hub",
  description: "An ultra-modern Java developer resource hub.",
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
      group: "Roadmap Mastery"
    }))
  );

  const searchItems = [...articles, ...roadmapItems];

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar searchItems={searchItems} />
          <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
