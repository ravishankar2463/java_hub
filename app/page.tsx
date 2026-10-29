import Link from "next/link";
import { BentoGrid, BentoGridItem } from "@/components/BentoGrid";
import { Map, FileText, Sparkles, Terminal, Cpu, Database, Server, ArrowRight } from "lucide-react";
import { getAllContent } from "@/lib/markdown";

export default function Home() {
  const allContent = getAllContent();
  const featuredItems = allContent.slice(0, 9);

  return (
    <div className="flex flex-col gap-16 sm:gap-20 pb-16 w-full">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center pt-8 sm:pt-14 pb-8 gap-6 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs sm:text-sm font-medium text-emerald-800 dark:text-emerald-300">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Modern Java 21+ • Virtual Threads • Architecture First</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-[1.12]">
          The Definitive <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400 bg-clip-text text-transparent">
            Java Developer Hub
          </span>
        </h1>

        <p className="max-w-2xl text-base sm:text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
          From foundational syntax and JVM heap mechanics to high-throughput concurrency, Spring Boot 3 internals, and multi-region Kubernetes systems.
        </p>

        {/* Hero Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 mt-2 w-full sm:w-auto">
          <Link
            href="/roadmap"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 font-semibold text-sm hover:opacity-90 transition-all shadow-md group"
          >
            <Map className="w-4 h-4 text-emerald-400 dark:text-slate-950 group-hover:scale-110 transition-transform" />
            <span>Explore 15-Level Roadmap</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/roadmap#level-8"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] text-slate-800 dark:text-slate-200 font-medium text-sm hover:bg-[var(--color-card-subtle)] transition-all shadow-xs"
          >
            <Server className="w-4 h-4 text-slate-500" />
            <span>Jump to Spring Boot & Cloud</span>
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 w-full mt-6">
          <div className="p-3.5 rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card)] text-center shadow-xs">
            <Cpu className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto mb-1.5" />
            <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">Project Loom</div>
            <div className="text-[11px] text-slate-500">Virtual Threads</div>
          </div>
          <div className="p-3.5 rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card)] text-center shadow-xs">
            <Server className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto mb-1.5" />
            <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">Spring Boot 3</div>
            <div className="text-[11px] text-slate-500">AOT & Security</div>
          </div>
          <div className="p-3.5 rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card)] text-center shadow-xs">
            <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto mb-1.5" />
            <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">Databases & JPA</div>
            <div className="text-[11px] text-slate-500">N+1 & HikariCP</div>
          </div>
          <div className="p-3.5 rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card)] text-center shadow-xs">
            <Terminal className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto mb-1.5" />
            <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">K8s & CI/CD</div>
            <div className="text-[11px] text-slate-500">Production Arch</div>
          </div>
        </div>
      </section>

      {/* Featured Lessons & Architecture Guides */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-4 border-b border-[var(--color-border)]">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Featured Deep-Dives
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Hand-crafted architectural guides from the 73-topic curriculum.
            </p>
          </div>
          <Link
            href="/roadmap"
            className="text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>View all 73 lessons</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <BentoGrid>
          {featuredItems.map((item, i) => {
            const isWide = i === 0 || i === 3;

            let url = `/${item.category || "general"}/${item.slug}`;
            let categoryName = item.category || "Article";

            if (item.type === "roadmap") {
              const normalizedPath = item.filePath.replace(/\\/g, "/");
              const pathParts = normalizedPath.split("/");
              const levelSlug = pathParts[pathParts.length - 2];
              url = `/roadmap/${levelSlug}/${item.slug}`;
              categoryName = levelSlug.replace("-", " ").toUpperCase();
            }

            return (
              <BentoGridItem
                key={i}
                title={item.frontmatter.title}
                description={item.frontmatter.description}
                url={url}
                category={categoryName}
                icon={<FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
                className={isWide ? "md:col-span-2" : "md:col-span-1"}
              />
            );
          })}
        </BentoGrid>
      </section>

      {/* Roadmap Call-To-Action Banner */}
      <section className="p-8 sm:p-12 rounded-3xl border border-[var(--color-card-border)] bg-[var(--color-card)] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="flex flex-col gap-2 text-center sm:text-left">
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Complete 15-Level Mastery Curriculum
          </h3>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl">
            Every topic is thoroughly explained with JVM mechanics, real production code examples, failure modes, and interview expectations.
          </p>
        </div>
        <Link
          href="/roadmap"
          className="shrink-0 flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 font-semibold text-sm hover:opacity-90 transition-all shadow-md"
        >
          <Map className="w-4 h-4 text-emerald-400 dark:text-slate-950" />
          <span>Launch Roadmap</span>
        </Link>
      </section>
    </div>
  );
}
