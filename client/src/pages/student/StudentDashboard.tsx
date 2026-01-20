import { DashboardLayout } from "@/components/DashboardLayout";
import { CourseCard } from "@/components/CourseCard";
import { useAuth } from "@/hooks/use-auth";
import { useMyEnrollments } from "@/hooks/use-learning";
import { Loader2, Search } from "lucide-react";

export default function StudentDashboard() {
  const { user } = useAuth();
  const { data: enrollments, isLoading } = useMyEnrollments();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">My Learning</h1>
            <p className="text-muted-foreground mt-2">Welcome back! Pick up where you left off.</p>
          </div>
          
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input 
              type="text" 
              placeholder="Search your courses..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : enrollments && enrollments.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment) => (
              <CourseCard 
                key={enrollment.id} 
                course={enrollment.course} 
                progress={enrollment.progress || 0}
                role="student" 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-border">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
              <Search size={32} />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">No courses found</h3>
            <p className="text-muted-foreground mb-6">You haven't enrolled in any courses yet.</p>
            <button className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors">
              Browse Course Catalog
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
