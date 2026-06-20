import Link from "next/link";
import { BentoGrid, BentoGridItem } from "@/components/BentoGrid";
import { MonitorPlay, Code, Database, Server, Map, FileText, ArrowRight } from "lucide-react";
import { getAllContent } from "@/lib/markdown";

export default function Home() {
  const articles = getAllContent().slice(0, 10); // Get latest 10 items (articles + roadmap topics)

  return (
    <div className="flex flex-col gap-16 pb-16">
      <section className="flex flex-col items-center justify-center text-center pt-24 pb-12 gap-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm text-neutral-600 dark:text-neutral-300">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          Java 21 Ready
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter bg-gradient-to-br from-neutral-900 to-neutral-500 dark:from-white dark:to-neutral-500 bg-clip-text text-transparent">
          The Modern <br /> Java Developer Hub
        </h1>
        <p className="max-w-[600px] text-lg text-neutral-600 dark:text-neutral-400">
          Premium resources, tutorials, and patterns for building scalable applications with Java, Spring, and beyond.
        </p>
        <div className="flex gap-4 mt-2">
          <Link href="/roadmap" className="flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background font-medium hover:opacity-90 transition-opacity">
            <Map className="w-4 h-4" />
            Explore the Mastery Roadmap
          </Link>
        </div>
      </section>

      <section>
        <BentoGrid>
          {articles.map((item, i) => {
            const isWide = i === 0 || i === 3;
            
            let url = `/${item.category || "general"}/${item.slug}`;
            if (item.type === 'roadmap') {
              const normalizedPath = item.filePath.replace(/\\/g, '/');
              const pathParts = normalizedPath.split('/');
              const levelSlug = pathParts[pathParts.length - 2];
              url = `/roadmap/${levelSlug}/${item.slug}`;
            }

            return (
              <BentoGridItem
                key={i}
                title={item.frontmatter.title}
                description={item.frontmatter.description}
                url={url}
                category={item.category || "General"}
                icon={<FileText className="h-6 w-6 text-emerald-400" />}
                className={isWide ? "md:col-span-2" : "md:col-span-1"}
              />
            );
          })}
        </BentoGrid>
      </section>
    </div>
  );
}
