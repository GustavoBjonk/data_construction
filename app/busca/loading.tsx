import { Container } from "@/components/layout/Container";
import { Skeleton } from "@/components/ui/Skeleton";

export default function SearchLoading() {
  return (
    <Container className="py-14">
      <span className="sr-only" role="status">
        Carregando resultados...
      </span>
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-6 h-12 w-2/3" />
      <Skeleton className="mt-8 h-[52px] w-full max-w-2xl rounded-full" />
      <div className="mt-12 max-w-4xl space-y-8">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index}>
            <Skeleton className="h-4 w-20" />
            <Skeleton className="mt-3 h-5 w-3/4" />
            <Skeleton className="mt-2 h-3 w-full" />
          </div>
        ))}
      </div>
    </Container>
  );
}
