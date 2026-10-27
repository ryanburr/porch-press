import { Suspense } from "react";
import { StoryView } from "@/components/story-view";

// StoryView reads the route params on the client; Cache Components needs that behind Suspense.
export default function StoryPage() {
  return (
    <Suspense>
      <StoryView />
    </Suspense>
  );
}
