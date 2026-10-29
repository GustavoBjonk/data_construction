import { Course } from "@/data/courses";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface CourseCardProps {
  course: Course;
}

function formatPrice(price: number): string {
  return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function CourseCard({ course }: CourseCardProps) {
  const meta = [course.platform, course.duration].filter(Boolean).join(" · ");
  const isFree = course.type === "free";

  return (
    <article className="card-interactive flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <Badge variant={isFree ? "accent" : "copper"}>{isFree ? "Gratuito" : "Pago"}</Badge>
        <Badge variant="outline">{course.level}</Badge>
      </div>

      <h3 className="mt-4 text-base font-medium leading-snug text-fg">{course.title}</h3>
      <p className="mt-1 font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-subtle">{meta}</p>

      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{course.description}</p>

      <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Habilidades">
        {course.skills.map((skill) => (
          <li key={skill}>
            <Badge variant="neutral">{skill}</Badge>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex items-end justify-between gap-4 border-t border-line pt-4">
        {!isFree && course.price !== undefined ? (
          <p className="text-sm font-medium text-fg">
            {formatPrice(course.price)}
            {course.priceCheckedAt && (
              <span className="block text-xs font-normal text-subtle">verificado em {course.priceCheckedAt}</span>
            )}
          </p>
        ) : (
          <span />
        )}
        <Button href={course.url} external withArrow variant="secondary" size="sm">
          Ver curso
        </Button>
      </div>
    </article>
  );
}
