import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { OfflineRoadmapManager } from "@/components/OfflineRoadmapManager";

export const metadata = {
  title: "Read the Java Roadmap Offline | JavaHub",
  description:
    "Save all 116 Java roadmap topics and their assets for offline reading on this device.",
};

export default function OfflinePage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 pb-16">
      <Link
        href="/"
        className="inline-flex min-h-11 w-fit items-center gap-2 rounded-lg text-sm font-medium text-slate-600 transition-colors hover:text-emerald-700 dark:text-slate-300 dark:hover:text-emerald-300"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to the roadmap
      </Link>
      <OfflineRoadmapManager />
    </div>
  );
}
