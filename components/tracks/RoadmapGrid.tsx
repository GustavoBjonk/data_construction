import { Roadmap } from "@/data/roadmaps";
import { RoadmapCard } from "./RoadmapCard";

interface RoadmapGridProps {
  roadmaps: Roadmap[];
}

export function RoadmapGrid({ roadmaps }: RoadmapGridProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {roadmaps.map((roadmap) => (
        <RoadmapCard key={roadmap.id} roadmap={roadmap} />
      ))}
    </div>
  );
}
