"use client";

import { useEffect } from "react";
import { markRoadmapTopicVisited } from "@/lib/roadmap-progress";
import { ROADMAP_PROGRESS_CHANGE_EVENT } from "@/hooks/useRoadmapProgress";

export function TopicVisitTracker({ topicId }: { topicId: string }) {
  useEffect(() => {
    try {
      markRoadmapTopicVisited(window.localStorage, topicId);
      window.dispatchEvent(new Event(ROADMAP_PROGRESS_CHANGE_EVENT));
    } catch (error) {
      console.error("Unable to save roadmap progress to local storage.", error);
    }
  }, [topicId]);

  return null;
}
