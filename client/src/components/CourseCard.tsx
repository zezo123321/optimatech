import { Course } from "@shared/schema";
import { Link } from "wouter";
import { Clock, BookOpen, ChevronRight } from "lucide-react";

interface CourseCardProps {
  course: Course;
  progress?: number;
  role: "student" | "instructor" | "admin";
}

export function CourseCard({ course, progress, role }: CourseCardProps) {
  // Use Unsplash placeholder if no thumbnail
  const thumbnail = course.thumbnailUrl || 
    `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60`; 
  // <!-- programming code screen -->

  const linkHref = role === "student" 
    ? `/learn/${course.id}` 
    : role === "instructor" 
      ? `/instructor/course/${course.id}` 
      : `/admin/course/${course.id}`;

  return (
    <div className="group dashboard-card overflow-hidden bg-white flex flex-col h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={thumbnail} 
          alt={course.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <Link href={linkHref}>
            <button className="w-full py-2 bg-white text-black font-semibold rounded-lg shadow-lg hover:bg-gray-100 transition-colors text-sm">
              {role === "student" ? "Continue Learning" : "Manage Course"}
            </button>
          </Link>
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 text-xs font-medium text-primary uppercase tracking-wider">
            <span className="px-2 py-0.5 rounded-full bg-primary/10">Course</span>
            {course.published ? (
              <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700">Published</span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">Draft</span>
            )}
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 leading-tight">
            {course.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {course.description || "No description provided."}
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-border/50">
          {progress !== undefined ? (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <BookOpen size={16} />
                  <span>Modules</span>
                </div>
              </div>
              <Link href={linkHref}>
                <span className="flex items-center gap-1 text-primary font-medium hover:underline cursor-pointer">
                  Details <ChevronRight size={14} />
                </span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
