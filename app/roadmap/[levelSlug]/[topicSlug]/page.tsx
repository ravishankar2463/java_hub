import { roadmapData } from "@/data/roadmap";
import { slugify } from "@/utils/slugify";
import { existsSync } from "node:fs";
import path from "path";
import { parseMarkdownFile } from "@/lib/markdown";
import { ArrowLeft, ArrowRight, ChevronRight, Clock, BookOpen, Layers, Share2, Check } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CodeBlock } from "@/components/CodeBlock";
import { MermaidDiagram } from "@/components/MermaidDiagram";
import { TableOfContents } from "@/components/TableOfContents";
import { ReadingProgressBar } from "@/components/ReadingProgressBar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import GithubSlugger from "github-slugger";
import type { Components } from "react-markdown";
import type { Metadata } from "next";

export const dynamicParams = false;

// Flatten all roadmap topics for sequential previous/next navigation
const allRoadmapTopics = roadmapData.flatMap((level) =>
  level.topics.map((topic) => ({
    levelNumber: level.level,
    levelTitle: level.title,
    levelSubtitle: level.subtitle,
    levelSlug: `level-${level.level}`,
    topicTitle: topic.title,
    topicSlug: slugify(topic.title),
  }))
);

export async function generateStaticParams() {
  return allRoadmapTopics.map((topic) => ({
    levelSlug: topic.levelSlug,
    topicSlug: topic.topicSlug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ levelSlug: string; topicSlug: string }>;
}): Promise<Metadata> {
  const { levelSlug, topicSlug } = await params;
  const topic = allRoadmapTopics.find(
    (t) => t.levelSlug === levelSlug && t.topicSlug === topicSlug
  );

  if (!topic) {
    return {
      title: "Topic Not Found | JavaHub",
    };
  }

  return {
    title: `${topic.topicTitle} - ${topic.levelTitle} | JavaHub`,
    description: `Deep-dive guide and architectural patterns for ${topic.topicTitle} in Java. Part of the Java Mastery Roadmap.`,
  };
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ levelSlug: string; topicSlug: string }>;
}) {
  const { levelSlug, topicSlug } = await params;

  const currentIndex = allRoadmapTopics.findIndex(
    (t) => t.levelSlug === levelSlug && t.topicSlug === topicSlug
  );

  if (currentIndex === -1) {
    notFound();
  }

  const currentTopic = allRoadmapTopics[currentIndex];
  const prevTopic = currentIndex > 0 ? allRoadmapTopics[currentIndex - 1] : null;
  const nextTopic = currentIndex < allRoadmapTopics.length - 1 ? allRoadmapTopics[currentIndex + 1] : null;

  const filePath = path.join(process.cwd(), "content", "roadmap", levelSlug, `${topicSlug}.md`);
  const doc = existsSync(filePath) ? parseMarkdownFile(filePath) : null;
  const markdownContent = doc
    ? doc.content
    : `## ${currentTopic.topicTitle}\n\nContent for this topic is currently being developed. The deep-dive details, code examples, and advanced insights will be published here soon.\n\n> **Check back shortly!**`;

  // Calculate estimated reading time based on word count
  const words = markdownContent.trim().split(/\s+/).length;
  const readingTimeMinutes = Math.max(3, Math.ceil(words / 220));

  // Extract headings for Table of Contents
  const slugger = new GithubSlugger();
  const headingLines = markdownContent
    .split("\n")
    .filter((line) => /^\s{0,3}#{2,3}\s/.test(line));
  const headings = headingLines.map((line) => {
    const level = line.match(/^\s{0,3}(#+)/)?.[1].length || 2;
    const text = line.replace(/^\s{0,3}#+\s/, "");
    const id = slugger.slug(text);
    return { id, text, level };
  });

  const markdownComponents: Components = {
    code({ className, children }) {
      const match = /language-(\w+)/.exec(className || "");
      if (match) {
        if (match[1] === "mermaid") {
          return <MermaidDiagram chart={String(children)} />;
        }
        return (
          <div className="my-6">
            <CodeBlock code={String(children).replace(/\n$/, "")} language={match[1]} />
          </div>
        );
      }
      return (
        <code className="bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded text-emerald-600 dark:text-emerald-300 font-mono text-sm">
          {children}
        </code>
      );
    },
    table({ children }) {
      return (
        <div className="overflow-x-auto my-6 rounded-xl border border-black/10 dark:border-white/10">
          <table className="min-w-full divide-y divide-black/10 dark:divide-white/10 text-sm">
            {children}
          </table>
        </div>
      );
    },
    blockquote({ children }) {
      return (
        <blockquote className="my-6 pl-4 border-l-4 border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 py-3 pr-4 rounded-r-xl italic text-neutral-700 dark:text-neutral-300">
          {children}
        </blockquote>
      );
    },
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Sticky Scroll Progress Bar */}
      <ReadingProgressBar />

      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center flex-wrap gap-2 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400"
      >
        <Link
          href="/roadmap"
          className="hover:text-foreground transition-colors flex items-center gap-1"
        >
          <span>Roadmap</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
        <Link
          href={`/roadmap#level-${currentTopic.levelNumber}`}
          className="hover:text-foreground transition-colors truncate max-w-[150px] sm:max-w-none"
        >
          Level {currentTopic.levelNumber}: {currentTopic.levelSubtitle}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
        <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-none">
          {currentTopic.topicTitle}
        </span>
      </nav>

      {/* Main Content & Table of Contents Layout */}
      <div className="flex flex-col xl:flex-row gap-8 xl:gap-12 relative items-start w-full">
        {/* Article Body Container */}
        <article className="flex-1 min-w-0 w-full p-6 sm:p-10 md:p-12 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.01] dark:bg-neutral-950/40 backdrop-blur-xl">
          {/* Header Metadata */}
          <header className="mb-8 pb-8 border-b border-black/10 dark:border-white/10">
            <div className="flex flex-wrap items-center gap-2.5 mb-4">
              <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Level {currentTopic.levelNumber}
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 text-xs rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-neutral-600 dark:text-neutral-400">
                <Clock className="w-3.5 h-3.5" />
                {readingTimeMinutes} min read
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 text-xs rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-neutral-600 dark:text-neutral-400">
                <BookOpen className="w-3.5 h-3.5" />
                Topic {currentIndex + 1} of {allRoadmapTopics.length}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.15] mb-4">
              {currentTopic.topicTitle}
            </h1>
            <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400">
              {currentTopic.levelTitle} &bull; {currentTopic.levelSubtitle}
            </p>
          </header>

          {/* Mobile Table of Contents (renders on screens < xl) */}
          <TableOfContents headings={headings} />

          {/* Markdown Content */}
          <div className="prose prose-base sm:prose-lg dark:prose-invert prose-emerald max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-emerald-500 hover:prose-a:underline prose-pre:bg-transparent prose-pre:p-0 prose-headings:scroll-mt-24">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSlug]}
              components={markdownComponents}
            >
              {markdownContent}
            </ReactMarkdown>
          </div>

          {/* Sequential Next / Previous Topic Navigation */}
          <footer className="mt-16 pt-8 border-t border-black/10 dark:border-white/10 flex flex-col gap-6">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              <span>Roadmap Progression</span>
              <span>{Math.round(((currentIndex + 1) / allRoadmapTopics.length) * 100)}% Completed</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Previous Topic Card */}
              {prevTopic ? (
                <Link
                  href={`/roadmap/${prevTopic.levelSlug}/${prevTopic.topicSlug}`}
                  className="flex flex-col gap-2 p-5 rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all group"
                >
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 group-hover:text-emerald-500 transition-colors">
                    <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                    <span>Previous Topic</span>
                  </div>
                  <span className="text-xs font-mono text-neutral-400">
                    Level {prevTopic.levelNumber}
                  </span>
                  <span className="text-sm sm:text-base font-semibold text-foreground group-hover:text-emerald-500 transition-colors line-clamp-2">
                    {prevTopic.topicTitle}
                  </span>
                </Link>
              ) : (
                <Link
                  href="/roadmap"
                  className="flex flex-col gap-2 p-5 rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] hover:border-black/20 dark:hover:border-white/20 transition-all group"
                >
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Roadmap Index</span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    Back to Roadmap Overview
                  </span>
                </Link>
              )}

              {/* Next Topic Card */}
              {nextTopic ? (
                <Link
                  href={`/roadmap/${nextTopic.levelSlug}/${nextTopic.topicSlug}`}
                  className="flex flex-col gap-2 p-5 rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all text-right sm:text-left group"
                >
                  <div className="flex items-center justify-end sm:justify-start gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 group-hover:text-emerald-500 transition-colors">
                    <span className="order-1 sm:order-2">Next Topic</span>
                    <ArrowRight className="w-3.5 h-3.5 order-2 sm:order-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <span className="text-xs font-mono text-neutral-400">
                    Level {nextTopic.levelNumber}
                  </span>
                  <span className="text-sm sm:text-base font-semibold text-foreground group-hover:text-emerald-500 transition-colors line-clamp-2">
                    {nextTopic.topicTitle}
                  </span>
                </Link>
              ) : (
                <Link
                  href="/roadmap"
                  className="flex flex-col gap-2 p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all text-right sm:text-left group"
                >
                  <div className="flex items-center justify-end sm:justify-start gap-1.5 text-xs text-emerald-500">
                    <span>Curriculum Completed!</span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    Return to Roadmap Overview
                  </span>
                </Link>
              )}
            </div>

            <div className="flex justify-center mt-4">
              <Link
                href="/roadmap"
                className="inline-flex items-center gap-2 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 hover:text-foreground transition-colors"
              >
                <Layers className="w-4 h-4" />
                <span>View Full 11-Level Roadmap</span>
              </Link>
            </div>
          </footer>
        </article>

        {/* Desktop Sticky Table of Contents (renders on screens >= xl) */}
        <div className="hidden xl:block">
          <TableOfContents headings={headings} />
        </div>
      </div>
    </div>
  );
}
