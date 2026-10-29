import { Dataset } from "@/data/datasets";
import { DatasetCard } from "./DatasetCard";

interface DatasetGridProps {
  datasets: Dataset[];
  withAnchor?: boolean;
}

export function DatasetGrid({ datasets, withAnchor = true }: DatasetGridProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {datasets.map((dataset) => (
        <DatasetCard key={dataset.id} dataset={dataset} withAnchor={withAnchor} />
      ))}
    </div>
  );
}
