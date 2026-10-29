import { RoadmapStep } from "@/data/roadmaps";
import { Course } from "@/data/courses";
import { Badge } from "@/components/ui/Badge";
import { CourseCard } from "./CourseCard";

interface RoadmapTimelineProps {
  steps: RoadmapStep[];
  courses: Course[];
}

function CourseGroup({ title, courses }: { title: string; courses: Course[] }) {
  if (courses.length === 0) return null;
  return (
    <div>
      <p className="eyebrow">{title}</p>
      <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}

export function RoadmapTimeline({ steps, courses }: RoadmapTimelineProps) {
  return (
    <ol className="relative">
      {steps.map((step, index) => {
        const stepCourses = step.courseIds
          .map((id) => courses.find((course) => course.id === id))
          .filter((course): course is Course => Boolean(course));
        const isLast = index === steps.length - 1;

        return (
          <li key={step.id} className="relative grid grid-cols-[2.75rem_1fr] gap-5 pb-14 last:pb-0 sm:grid-cols-[4rem_1fr] sm:gap-8">
            {!isLast && (
              <span aria-hidden="true" className="absolute bottom-0 left-[1.375rem] top-12 w-px bg-line sm:left-8" />
            )}
            <span className="relative flex h-11 w-11 items-center justify-center rounded-full border border-line-strong bg-bg font-mono text-xs text-accent sm:mx-auto">
              {String(step.order).padStart(2, "0")}
            </span>

            <div className="min-w-0 pt-2">
              <h3 className="font-display text-xl font-medium tracking-tight text-fg sm:text-2xl">{step.title}</h3>
              <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted sm:text-base">{step.description}</p>

              {(step.topics.length > 0 || step.technologies.length > 0) && (
                <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Tópicos e tecnologias">
                  {step.technologies.map((tech) => (
                    <li key={tech}>
                      <Badge variant="accent">{tech}</Badge>
                    </li>
                  ))}
                  {step.topics.map((topic) => (
                    <li key={topic}>
                      <Badge variant="neutral">{topic}</Badge>
                    </li>
                  ))}
                </ul>
              )}

              {stepCourses.length > 0 && (
                <div className="mt-8 space-y-6">
                  <CourseGroup title="Cursos gratuitos" courses={stepCourses.filter((c) => c.type === "free")} />
                  <CourseGroup title="Cursos de baixo custo" courses={stepCourses.filter((c) => c.type === "paid")} />
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
