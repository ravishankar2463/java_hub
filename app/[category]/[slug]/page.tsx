import { getArticles } from "@/lib/markdown";
import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CodeBlock } from "@/components/CodeBlock";
import { MermaidDiagram } from "@/components/MermaidDiagram";
import { TableOfContents } from "@/components/TableOfContents";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import GithubSlugger from "github-slugger";

export async function generateStaticParams() {
  const articles = getArticles();
  return articles.map((article) => ({
    category: article.category || "general",
    slug: article.slug,
  }));
}

export default async function ArticlePage({ params }: { params: Promise<{ category: string; slug: string }> }) {
  const { category, slug } = await params;
  
  const articles = getArticles();
  const article = articles.find(
    (a) => a.slug === slug && (a.category === category || (category === "general" && !a.category))
  );

  if (!article) {
    notFound();
  }

  const slugger = new GithubSlugger();
  const headingLines = article.content.split('\n').filter(line => line.match(/^#{2,3}\s/));
  const headings = headingLines.map(line => {
    const level = line.match(/^#+/)?.[0].length || 2;
    const text = line.replace(/^#+\s/, '');
    const id = slugger.slug(text);
    return { id, text, level };
  });

  return (
    <div className="min-h-screen pt-24 pb-16 px-6 max-w-7xl mx-auto flex flex-col gap-8">
      <Link href="/" className="inline-flex items-center gap-2 text-neutral-500 dark:text-neutral-400 hover:text-foreground transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>
      
      <div className="flex flex-col lg:flex-row gap-12 relative items-start">
        <div className="flex-1 min-w-0 p-8 md:p-12 rounded-2xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-neutral-950/50 backdrop-blur-xl">
          <div className="flex flex-col gap-4 mb-8 pb-8 border-b border-black/10 dark:border-white/10">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
              {article.frontmatter.title}
            </h1>
            {article.frontmatter.description && (
              <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl">
                {article.frontmatter.description}
              </p>
            )}
            <div className="flex items-center gap-4 mt-2">
              <span className="px-3 py-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-full text-xs font-medium text-blue-600 dark:text-blue-400">
                {article.frontmatter.category || "General"}
              </span>
              {article.frontmatter.date && (
                <span className="text-sm text-neutral-500">
                  {new Date(article.frontmatter.date).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          <div className="prose prose-lg dark:prose-invert prose-blue max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-blue-400 prose-pre:bg-transparent prose-pre:p-0 prose-headings:scroll-mt-24">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSlug]}
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || "");
                  if (!inline && match) {
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
                    <code className="bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded text-blue-600 dark:text-blue-300 font-mono text-sm" {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {article.content}
            </ReactMarkdown>
          </div>
        </div>

        <TableOfContents headings={headings} />
      </div>
    </div>
  );
}
