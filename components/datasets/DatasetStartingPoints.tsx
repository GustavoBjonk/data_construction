import { ArrowRightIcon } from "@/components/ui/Icons";

interface StartingPath {
  question: string;
  datasets: { id: string; name: string }[];
}

const STARTING_PATHS: StartingPath[] = [
  {
    question: "Quero aprender análise de dados",
    datasets: [
      { id: "superstore", name: "Superstore" },
      { id: "netflix-titles", name: "Netflix" },
      { id: "world-happiness-report", name: "World Happiness Report" },
    ],
  },
  {
    question: "Quero aprender Machine Learning",
    datasets: [
      { id: "iris", name: "Iris" },
      { id: "titanic", name: "Titanic" },
      { id: "california-housing", name: "California Housing" },
    ],
  },
  {
    question: "Quero praticar projetos mais próximos do mercado",
    datasets: [
      { id: "credit-card-fraud", name: "Credit Card Fraud Detection" },
      { id: "nyc-taxi-trips", name: "NYC Taxi Trips" },
      { id: "superstore", name: "Superstore" },
    ],
  },
];

export function DatasetStartingPoints() {
  return (
    <section aria-labelledby="por-onde-comecar">
      <h2 id="por-onde-comecar" className="eyebrow text-fg">
        Não sabe qual dataset escolher?
      </h2>

      <div className="mt-6 grid grid-cols-1 border-y border-line sm:grid-cols-3">
        {STARTING_PATHS.map((path, index) => (
          <div
            key={path.question}
            className={`py-6 sm:px-6 sm:first:pl-0 ${index > 0 ? "border-t border-line sm:border-l sm:border-t-0" : ""}`}
          >
            <p className="font-mono text-[0.6875rem] text-subtle">{String(index + 1).padStart(2, "0")}</p>
            <p className="mt-2 font-display text-lg font-medium leading-snug text-fg">{path.question}</p>
            <ul className="mt-4 space-y-1">
              {path.datasets.map((dataset) => (
                <li key={dataset.id}>
                  <a
                    href={`#dataset-${dataset.id}`}
                    className="group inline-flex min-h-[36px] items-center gap-2 text-sm text-muted transition-colors hover:text-accent"
                  >
                    <ArrowRightIcon size={14} className="text-accent transition-transform group-hover:translate-x-0.5" />
                    {dataset.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
