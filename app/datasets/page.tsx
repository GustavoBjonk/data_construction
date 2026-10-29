import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { DatasetExplorer } from "@/components/datasets/DatasetExplorer";
import { DatasetGrid } from "@/components/datasets/DatasetGrid";
import { DatasetStartingPoints } from "@/components/datasets/DatasetStartingPoints";
import { AdSlot } from "@/components/monetization/AdSlot";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { DATASET_CATEGORIES, DATASET_DIFFICULTIES } from "@/data/datasets";
import { getCatalog, pickByIds } from "@/lib/content";
import { absoluteUrl } from "@/lib/site";

const DESCRIPTION =
  "Datasets conhecidos para estudar análise de dados, SQL, Python, BI e Machine Learning, com link direto para a fonte oficial.";

export const metadata: Metadata = {
  title: "Datasets para praticar",
  description: DESCRIPTION,
  alternates: { canonical: "/datasets" },
  openGraph: { title: "Datasets para praticar", description: DESCRIPTION, url: "/datasets" },
};

const HIGHLIGHT_IDS = ["titanic", "iris", "credit-card-fraud"];

export const revalidate = 300;

export default async function DatasetsPage() {
  const { datasets } = await getCatalog();
  const highlighted = pickByIds(datasets, HIGHLIGHT_IDS);

  return (
    <>
      <JsonLd
        data={datasets.map((dataset) => ({
          "@context": "https://schema.org",
          "@type": "Dataset",
          name: dataset.name,
          description: dataset.description,
          url: absoluteUrl(`/datasets#dataset-${dataset.id}`),
          sameAs: dataset.sourceUrl,
          keywords: [dataset.category, ...dataset.topics],
          ...(dataset.format ? { encodingFormat: dataset.format } : {}),
        }))}
      />

      <PageHeader
        eyebrow={`${datasets.length} datasets selecionados`}
        title={
          <>
            Aprenda
            <br />
            fazendo<span className="text-accent">.</span>
          </>
        }
        lead="Datasets conhecidos para praticar análise de dados, SQL, Python, BI, estatística e Machine Learning — todos com link direto para a fonte oficial."
        breadcrumbs={[{ label: "Datasets", href: "/datasets" }]}
      />

      <Container className="space-y-16 py-12 sm:space-y-20 sm:py-16">
        {highlighted.length > 0 && (
          <section aria-labelledby="datasets-populares">
            <SectionHeader id="datasets-populares" title="Mais usados para começar" />
            <div className="mt-6">
              <DatasetGrid datasets={highlighted} withAnchor={false} />
            </div>
          </section>
        )}

        <AdSlot placement="datasets-mid" />

        <DatasetStartingPoints />

        <section aria-labelledby="todos-datasets">
          <SectionHeader id="todos-datasets" title="Todos os datasets" />
          <div className="mt-8">
            <DatasetExplorer datasets={datasets} categories={DATASET_CATEGORIES} difficulties={DATASET_DIFFICULTIES} />
          </div>
        </section>
      </Container>
    </>
  );
}
