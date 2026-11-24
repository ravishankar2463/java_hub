import { RoadmapContent } from "@/components/RoadmapContent";
import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/seo.mjs";

export const metadata: Metadata = {
  title: "Java Roadmap: 16 Levels, 116 Topics",
  description:
    "Explore a structured Java developer roadmap with 16 learning levels and 116 topics, from programming fundamentals and JVM internals to Spring Boot and distributed systems.",
  alternates: {
    canonical: getSiteUrl("/"),
  },
};

export default function RoadmapPage() {
  return <RoadmapContent />;
}
