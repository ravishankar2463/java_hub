import { RoadmapContent } from "@/components/RoadmapContent";
import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/seo.mjs";

export const metadata: Metadata = {
  title: "Java Developer Roadmap: Java, Spring Boot & Backend",
  description:
    "Learn Java step by step with a practical developer roadmap covering Core Java, JVM internals, Spring Boot, Spring Security, microservices, cloud, and backend architecture. Includes 16 levels, 116 topics, and hands-on labs.",
  alternates: {
    canonical: getSiteUrl("/"),
  },
  openGraph: {
    type: "website",
    siteName: "JavaHub",
    title: "Java Developer Roadmap: Java, Spring Boot & Backend",
    description:
      "Learn Java step by step: Core Java, JVM internals, Spring Boot, Spring Security, microservices, cloud, and backend architecture across 16 levels and 116 topics.",
    url: getSiteUrl("/"),
  },
  twitter: {
    card: "summary",
    title: "Java Developer Roadmap: Java, Spring Boot & Backend",
    description:
      "Learn Java step by step, from Core Java and JVM internals to Spring Boot, microservices, and backend architecture.",
  },
};

export default function Home() {
  return <RoadmapContent />;
}
