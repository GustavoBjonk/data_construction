import { Course } from "@/data/courses";
import { EmptyState } from "@/components/ui/EmptyState";
import { CourseCard } from "./CourseCard";

interface CourseGridProps {
  courses: Course[];
  emptyMessage?: string;
}

export function CourseGrid({ courses, emptyMessage = "Nenhum curso encontrado." }: CourseGridProps) {
  if (courses.length === 0) {
    return <EmptyState title={emptyMessage} description="Tente outro termo ou remova os filtros." />;
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
