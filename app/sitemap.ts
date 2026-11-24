import type { MetadataRoute } from "next";
import { getArticles } from "@/lib/markdown";
import { roadmapData } from "@/data/roadmap";
import { slugify } from "@/utils/slugify";
import { getSiteUrl } from "@/lib/seo.mjs";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const topicPaths = roadmapData.flatMap((level) =>
    level.topics.map(
      (topic) => `/roadmap/level-${level.level}/${slugify(topic.title)}`
    )
  );
  const articlePaths = getArticles().map(
    (article) => `/${article.category || "general"}/${article.slug}`
  );

  return ["/", "/about", ...topicPaths, ...articlePaths].map((pathname) => ({
    url: getSiteUrl(pathname),
  }));
}
