import { Course } from "@shared/schema";
import { Link } from "wouter";
import { Clock, BookOpen, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CourseCardProps {
  course: Course;
  progress?: number;
  role: "student" | "instructor" | "admin";
  isEnrolled?: boolean;
  onEnroll?: () => void;
  isLoading?: boolean;
}

export function CourseCard({ course, progress, role, isEnrolled, onEnroll, isLoading }: CourseCardProps) {
  // Use Unsplash placeholder if no thumbnail
  const thumbnail = course.thumbnailUrl ||
    `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60`;

  const linkHref = role === "student"
    ? `/learn/${course.id}`
    : role === "instructor"
      ? `/instructor/course/${course.id}`
      : `/admin/course/${course.id}`;

  const showEnrollButton = role === "student" && isEnrolled === false && onEnroll;

  return (
    <div className="group dashboard-card overflow-hidden bg-white flex flex-col h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-border/60">
      <div className="relative h-48 overflow-hidden">
        <img
          src={thumbnail}
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
          {showEnrollButton ? (
            <button
              onClick={(e) => {
                e.preventDefault();
                onEnroll?.();
              }}
              disabled={isLoading}
              className="w-full py-2.5 bg-primary text-white font-bold rounded-lg shadow-lg hover:bg-primary/90 transition-all text-sm disabled:opacity-70 active:scale-95"
            >
              {isLoading ? "Enrolling..." : "Enroll Now"}
            </button>
          ) : (
            <Link href={linkHref}>
              <button className="w-full py-2.5 bg-white text-foreground font-bold rounded-lg shadow-lg hover:bg-gray-50 transition-all text-sm active:scale-95">
                {role === "student" ? "Continue Learning" : "Manage Course"}
              </button>
            </Link>
          )}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider">
            {!course.published && (
              <span className="px-2 py-1 rounded-md bg-yellow-500/10 text-yellow-600 border border-yellow-500/20">Draft</span>
            )}
            <span className="px-2 py-1 rounded-md bg-primary/10 text-primary border border-primary/20">Course</span>
          </div>
          <h3 className="text-xl font-display font-bold text-foreground mb-2 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
            {course.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
            {course.description || "No description provided."}
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-border/40">
          {progress !== undefined ? (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                <span>Progress</span>
                <span className={progress === 100 ? "text-green-600" : ""}>{progress}%</span>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-1000 ease-out",
                    progress === 100 ? "bg-green-500" : "bg-primary"
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Clock size={14} />
                <span className="text-xs">Self-paced</span>
              </div>
              <Link href={linkHref}>
                <span className="flex items-center gap-1 text-primary font-semibold hover:gap-2 transition-all cursor-pointer text-xs uppercase tracking-wide">
                  View Details <ChevronRight size={14} />
                </span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
