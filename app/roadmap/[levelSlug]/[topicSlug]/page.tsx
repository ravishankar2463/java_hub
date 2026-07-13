import { roadmapData } from "@/data/roadmap";
import { slugify } from "@/utils/slugify";
import fs from "fs";
import path from "path";
import { parseMarkdownFile } from "@/lib/markdown";
import { ArrowLeft, Map } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CodeBlock } from "@/components/CodeBlock";
import { MermaidDiagram } from "@/components/MermaidDiagram";
import { TableOfContents } from "@/components/TableOfContents";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import GithubSlugger from "github-slugger";
export const dynamicParams = false;

export async function generateStaticParams() {
  const params: { levelSlug: string; topicSlug: string }[] = [];

  roadmapData.forEach((level) => {
    const levelSlug = `level-${level.level}`;
    level.topics.forEach((topic) => {
      params.push({
        levelSlug,
        topicSlug: slugify(topic.title),
      });
    });
  });

  return params;
}

export default async function TopicPage({ params }: { params: Promise<{ levelSlug: string; topicSlug: string }> }) {
  const { levelSlug, topicSlug } = await params;
  
  let isValid = false;
  let topicTitle = "";
  
  roadmapData.forEach(level => {
    if (`level-${level.level}` === levelSlug) {
      level.topics.forEach(topic => {
        if (slugify(topic.title) === topicSlug) {
          isValid = true;
          topicTitle = topic.title;
        }
      });
    }
  });

  if (!isValid) {
    notFound();
  }

  const filePath = path.join(process.cwd(), "content", "roadmap", levelSlug, `${topicSlug}.md`);
  
  const doc = parseMarkdownFile(filePath);
  const markdownContent = doc ? doc.content : `## ${topicTitle}\n\nContent for this topic is currently being developed. The deep-dive details, code examples, and advanced insights will be published here soon.\n\n> **Check back shortly!**`;

  const slugger = new GithubSlugger();
  const headingLines = markdownContent.split('\n').filter(line => line.match(/^#{2,3}\s/));
  const headings = headingLines.map(line => {
    const level = line.match(/^#+/)?.[0].length || 2;
    const text = line.replace(/^#+\s/, '');
    const id = slugger.slug(text);
    return { id, text, level };
  });

  return (
    <div className="min-h-screen pt-24 pb-16 px-6 max-w-7xl mx-auto flex flex-col gap-8">
      <Link href="/roadmap" className="inline-flex items-center gap-2 text-neutral-500 dark:text-neutral-400 hover:text-foreground transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" />
        Back to Roadmap
      </Link>
      
      
      <div className="flex flex-col lg:flex-row gap-12 relative items-start">
        <div className="flex-1 min-w-0 p-8 md:p-12 rounded-2xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-neutral-950/50 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-8 pb-8 border-b border-black/10 dark:border-white/10">
            <div className="p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10">
              <Map className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              {topicTitle}
            </h1>
          </div>

          <div className="prose prose-lg dark:prose-invert prose-emerald max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-emerald-400 prose-pre:bg-transparent prose-pre:p-0 prose-headings:scroll-mt-24">
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
                    <code className="bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded text-emerald-600 dark:text-emerald-300 font-mono text-sm" {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {markdownContent}
            </ReactMarkdown>
          </div>
        </div>

        <TableOfContents headings={headings} />
      </div>
    </div>
  );
}
