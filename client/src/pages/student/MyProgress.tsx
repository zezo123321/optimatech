import { DashboardLayout } from "@/components/DashboardLayout";
import { CourseCard } from "@/components/CourseCard";
import { useAuth } from "@/hooks/use-auth";
import { useMyEnrollments } from "@/hooks/use-learning";
import { Loader2, Search, Trophy, Timer, BookOpen, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function MyProgress() {
    const { user } = useAuth();
    const { data: enrollments, isLoading } = useMyEnrollments();

    // Calculate generic stats
    const totalCourses = enrollments?.length || 0;
    const completedCourses = enrollments?.filter(e => (e.progress || 0) >= 100).length || 0;
    const averageProgress = totalCourses > 0
        ? Math.round(enrollments!.reduce((acc, curr) => acc + (curr.progress || 0), 0) / totalCourses)
        : 0;

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-display font-bold text-foreground">My Progress</h1>
                    <p className="text-muted-foreground mt-2">Track your learning journey and achievements.</p>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalCourses}</div>
                            <p className="text-xs text-muted-foreground">Enrolled courses</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Completed</CardTitle>
                            <Trophy className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{completedCourses}</div>
                            <p className="text-xs text-muted-foreground">Successfully finished</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
                            <Target className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{averageProgress}%</div>
                            <Progress value={averageProgress} className="h-2 mt-2" />
                        </CardContent>
                    </Card>
                </div>

                {/* Enrollments List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Detailed Progress</h2>

                    {isLoading ? (
                        <div className="h-40 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : enrollments && enrollments.length > 0 ? (
                        <div className="grid gap-6">
                            {enrollments.map((enrollment) => (
                                <div key={enrollment.id} className="bg-card border rounded-xl p-6 flex flex-col md:flex-row md:items-center gap-6 shadow-sm hover:shadow-md transition-shadow">
                                    {/* Thumbnail */}
                                    <div className="w-full md:w-48 aspect-video rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                        {enrollment.course.thumbnailUrl ? (
                                            <img
                                                src={enrollment.course.thumbnailUrl}
                                                alt={enrollment.course.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                <BookOpen />
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 space-y-2">
                                        <h3 className="font-bold text-lg">{enrollment.course.title}</h3>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Timer size={14} /> Last accessed: {new Date(enrollment.enrolledAt || new Date()).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="mt-4 space-y-1">
                                            <div className="flex justify-between text-sm font-medium">
                                                <span>Progress</span>
                                                <span>{enrollment.progress || 0}%</span>
                                            </div>
                                            <Progress value={enrollment.progress || 0} className="h-2 w-full" />
                                        </div>
                                    </div>

                                    {/* Action */}
                                    <div className="flex-shrink-0">
                                        <Link href={`/learn/${enrollment.courseId}`}>
                                            <Button>Continue Learning</Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-muted/20 border-dashed border-2 border-muted rounded-xl">
                            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium">No active courses</h3>
                            <p className="text-muted-foreground mb-4">You haven't started any courses yet.</p>
                            <Link href="/courses"><Button variant="outline">Browse Catalog</Button></Link>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
