import { useQuery } from "@tanstack/react-query";
import { Course } from "@shared/schema";
import { DashboardLayout } from "@/components/DashboardLayout";
import { CourseCard } from "@/components/CourseCard";
import { Loader2, Search, BookOpen } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useMyEnrollments, useEnroll } from "@/hooks/use-learning";
import { useToast } from "@/hooks/use-toast";

export default function CoursesPage() {
    const { user } = useAuth();
    const { toast } = useToast();

    // Fetch all published courses
    const { data: courses, isLoading: isCoursesLoading } = useQuery<Course[]>({
        queryKey: ["/api/courses"], // Reusing the same endpoint, assuming it returns accessible courses
    });

    // Fetch my enrollments to check status
    const { data: enrollments, isLoading: isEnrollmentsLoading } = useMyEnrollments();
    const enrollMutation = useEnroll();

    const handleEnroll = (courseId: number) => {
        if (!user) return;
        enrollMutation.mutate({ courseId, userId: user.id }, {
            onSuccess: () => {
                toast({
                    title: "Enrolled Successfully",
                    description: "You have been enrolled in the course. Check 'My Learning'.",
                });
            },
            onError: (error) => {
                toast({
                    title: "Enrollment Failed",
                    description: error.message,
                    variant: "destructive",
                });
            }
        });
    };

    const isLoading = isCoursesLoading || isEnrollmentsLoading;

    return (
        <DashboardLayout>
            <div className="space-y-10">
                {/* Hero / Header */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-indigo-600 p-10 text-white shadow-2xl">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-black/10 rounded-full blur-2xl pointer-events-none" />

                    <div className="relative z-10 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/20 backdrop-blur-sm text-sm font-medium mb-6">
                            <BookOpen size={16} />
                            <span>Course Library</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 leading-tight">
                            Expand Your Knowledge
                        </h1>
                        <p className="text-white/80 text-lg leading-relaxed mb-8 max-w-xl">
                            Explore our comprehensive catalog of professional courses designed to help you master new skills and advance your career.
                        </p>

                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary h-5 w-5" />
                            <input
                                type="text"
                                placeholder="What do you want to learn today?"
                                className="w-full pl-12 pr-4 py-4 rounded-xl border-0 bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-4 focus:ring-white/20 shadow-xl transition-all font-medium"
                            />
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                {isLoading ? (
                    <div className="h-64 flex items-center justify-center">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    </div>
                ) : courses && courses.length > 0 ? (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold font-display text-foreground">All Courses</h2>
                            <span className="text-sm text-muted-foreground">{courses.length} courses available</span>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {courses.map((course) => {
                                const isEnrolled = enrollments?.some(e => e.courseId === course.id);
                                return (
                                    <CourseCard
                                        key={course.id}
                                        course={course}
                                        progress={undefined}
                                        role="student"
                                        isEnrolled={isEnrolled}
                                        onEnroll={() => handleEnroll(course.id)}
                                        isLoading={enrollMutation.isPending}
                                    />
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-border/60">
                        <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground">
                            <BookOpen size={40} className="opacity-50" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-3">No courses available yet</h3>
                        <p className="text-muted-foreground mb-8 text-lg max-w-md mx-auto">
                            Check back soon! Our instructors are crafting amazing new content for you.
                        </p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
