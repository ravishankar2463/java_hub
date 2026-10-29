import { getArticles } from "@/lib/markdown";
import { ArrowLeft, ChevronRight, Clock, Calendar } from "lucide-react";
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

export async function generateStaticParams() {
  const articles = getArticles();
  return articles.map((article) => ({
    category: article.category || "general",
    slug: article.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { category, slug } = await params;
  const articles = getArticles();
  const article = articles.find(
    (a) => a.slug === slug && (a.category === category || (category === "general" && !a.category))
  );

  if (!article) {
    return {
      title: "Article Not Found | JavaHub",
    };
  }

  return {
    title: `${article.frontmatter.title} | JavaHub Articles`,
    description: article.frontmatter.description || "In-depth Java article and guide.",
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;

  const articles = getArticles();
  const article = articles.find(
    (a) => a.slug === slug && (a.category === category || (category === "general" && !a.category))
  );

  if (!article) {
    notFound();
  }

  const slugger = new GithubSlugger();
  const headingLines = article.content
    .split("\n")
    .filter((line) => /^\s{0,3}#{2,3}\s/.test(line));
  const headings = headingLines.map((line) => {
    const level = line.match(/^\s{0,3}(#+)/)?.[1].length || 2;
    const text = line.replace(/^\s{0,3}#+\s/, "");
    const id = slugger.slug(text);
    return { id, text, level };
  });

  const words = article.content.trim().split(/\s+/).length;
  const readingTimeMinutes = Math.max(2, Math.ceil(words / 220));

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
        <code className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 px-1.5 py-0.5 rounded font-mono text-xs sm:text-sm font-medium">
          {children}
        </code>
      );
    },
    table({ children }) {
      return (
        <div className="overflow-x-auto my-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-xs">
          <table className="min-w-full divide-y divide-[var(--color-border)] text-sm text-slate-700 dark:text-slate-300">
            {children}
          </table>
        </div>
      );
    },
    blockquote({ children }) {
      return (
        <blockquote className="my-6 pl-4 border-l-4 border-emerald-600/70 dark:border-emerald-400/70 bg-emerald-50/60 dark:bg-emerald-950/30 py-3 pr-4 rounded-r-xl italic text-slate-700 dark:text-slate-300 leading-relaxed">
          {children}
        </blockquote>
      );
    },
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      <ReadingProgressBar />

      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center flex-wrap gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400"
      >
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="capitalize">{category}</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-none">
          {article.frontmatter.title}
        </span>
      </nav>

      {/* Main Content & Table of Contents */}
      <div className="flex flex-col xl:flex-row gap-8 xl:gap-12 relative items-start w-full">
        <article className="flex-1 min-w-0 w-full p-6 sm:p-10 md:p-12 rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] shadow-xs">
          <header className="mb-8 pb-8 border-b border-[var(--color-border)]">
            <div className="flex flex-wrap items-center gap-2.5 mb-4">
              <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                {article.frontmatter.category || category}
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 text-xs rounded-full bg-[var(--color-card-subtle)] border border-[var(--color-border)] text-slate-600 dark:text-slate-300">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {readingTimeMinutes} min read
              </span>
              {article.frontmatter.date && (
                <span className="flex items-center gap-1.5 px-3 py-1 text-xs rounded-full bg-[var(--color-card-subtle)] border border-[var(--color-border)] text-slate-600 dark:text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {new Date(article.frontmatter.date).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-[1.15] mb-4">
              {article.frontmatter.title}
            </h1>
            {article.frontmatter.description && (
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-3xl">
                {article.frontmatter.description}
              </p>
            )}
          </header>

          {/* Mobile Table of Contents (renders on screens < xl) */}
          <TableOfContents headings={headings} variant="mobile" />

          <div className="prose prose-base sm:prose-lg dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 prose-headings:text-slate-900 dark:prose-headings:text-slate-100 prose-headings:font-bold prose-headings:tracking-tight prose-a:text-emerald-700 dark:prose-a:text-emerald-400 hover:prose-a:underline prose-pre:bg-transparent prose-pre:p-0 prose-headings:scroll-mt-24">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSlug]}
              components={markdownComponents}
            >
              {article.content}
            </ReactMarkdown>
          </div>

          <footer className="mt-16 pt-8 border-t border-[var(--color-border)] flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Articles</span>
            </Link>
            <Link
              href="/roadmap"
              className="inline-flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400 hover:underline font-medium"
            >
              <span>Explore Mastery Roadmap &rarr;</span>
            </Link>
          </footer>
        </article>

        {/* Desktop Sticky Table of Contents (renders on screens >= xl) */}
        <TableOfContents headings={headings} variant="desktop" />
      </div>
    </div>
  );
}
