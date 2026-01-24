import { useParams, Link } from "wouter";
import { useCourse, useToggleLessonCompletion } from "@/hooks/use-courses";
import { Loader2, ChevronLeft, CheckCircle, Circle, PlayCircle, FileText, Download, Check } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Lesson, Module } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import LessonDiscussion from "@/components/student/LessonDiscussion";

export default function CoursePlayer() {
  const { id } = useParams<{ id: string }>();
  const courseId = Number(id);
  const { data: course, isLoading } = useCourse(courseId);
  const toggleCompletion = useToggleLessonCompletion();
  const { toast } = useToast();

  const [activeModuleId, setActiveModuleId] = useState<number | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  // Initialize active lesson on load
  useEffect(() => {
    if (course?.modules?.[0] && !activeLesson) {
      // Try to find the first incomplete lesson, or just the first lesson
      let firstLesson = course.modules[0].lessons?.[0];

      // Flatten lessons to find first incomplete
      const allLessons = course.modules.flatMap(m => m.lessons || []);
      const firstIncomplete = allLessons.find(l => !course.completedLessonIds?.includes(l.id));

      if (firstIncomplete) {
        setActiveLesson(firstIncomplete);
        setActiveModuleId(course.modules.find(m => m.lessons?.some(l => l.id === firstIncomplete.id))?.id || null);
      } else if (firstLesson) {
        setActiveLesson(firstLesson);
        setActiveModuleId(course.modules[0].id);
      }
    }
  }, [course]);

  // Calculate Progress
  const progressPercent = useMemo(() => {
    if (!course || !course.modules) return 0;
    const allLessons = course.modules.flatMap(m => m.lessons || []);
    if (allLessons.length === 0) return 0;
    const completedCount = course.completedLessonIds?.length || 0;
    // Cap at 100 in case of stale data
    return Math.min(Math.round((completedCount / allLessons.length) * 100), 100);
  }, [course]);

  // Handle Mark as Complete / Toggle
  const handleToggleComplete = async () => {
    if (!activeLesson) return;

    const isCompleted = course?.completedLessonIds?.includes(activeLesson.id);

    try {
      const result = await toggleCompletion.mutateAsync({
        courseId,
        lessonId: activeLesson.id,
        completed: !isCompleted
      });

      if (!isCompleted) {
        if (result.xpGained && result.xpGained > 0) {
          toast({
            title: `Lesson Completed!`,
            description: `+${result.xpGained} XP Gained! Keep it up! 🚀`,
            className: "bg-green-50 border-green-200"
          });
        } else {
          toast({ title: "Lesson Completed!", description: "Great job, keep going." });
        }
        // Optional: Auto-advance could go here
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update progress.", variant: "destructive" });
    }
  };

  const isCurrentLessonCompleted = activeLesson && course?.completedLessonIds?.includes(activeLesson.id);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Course not found</h2>
          <Link href="/dashboard" className="text-primary hover:underline">Go back to dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top Bar */}
      <header className="h-16 border-b border-border bg-white px-4 flex items-center justify-between flex-shrink-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <div className="p-2 hover:bg-muted rounded-full cursor-pointer transition-colors text-muted-foreground hover:text-foreground">
              <ChevronLeft size={24} />
            </div>
          </Link>
          <div className="w-px h-6 bg-border mx-2" />
          <h1 className="font-display font-bold text-lg truncate max-w-md hidden md:block" title={course.title}>
            {course.title}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end min-w-[120px]">
            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Progress</span>
              <span className="text-xs font-bold text-primary">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
            U
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Modules */}
        <aside className="w-80 border-r border-border bg-muted/10 overflow-y-auto flex-shrink-0 hidden md:block">
          <div className="p-4">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Course Content</h3>
            <div className="space-y-4">
              {course.modules?.map((module: any) => (
                <div key={module.id} className="space-y-2">
                  <div className="font-medium text-sm text-foreground px-2">
                    {module.title}
                  </div>
                  <div className="space-y-1">
                    {module.lessons?.map((lesson: any) => {
                      const isActive = activeLesson?.id === lesson.id;
                      const isCompleted = course.completedLessonIds?.includes(lesson.id);

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => setActiveLesson(lesson)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors text-left group",
                            isActive
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
                          {isCompleted ? (
                            <CheckCircle size={16} className="flex-shrink-0 text-green-500" />
                          ) : (
                            isActive ? (
                              <PlayCircle size={16} className="flex-shrink-0" />
                            ) : (
                              <Circle size={16} className="flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
                            )
                          )}
                          <span className={cn("truncate", isCompleted && !isActive && "text-muted-foreground/70")}>{lesson.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-white p-6 md:p-10">
          <div className="max-w-4xl mx-auto">
            {activeLesson ? (
              <div key={activeLesson.id} className="space-y-8 animate-in fade-in duration-300">
                <div className="border-b border-border pb-6">
                  <div className="flex items-center gap-2 text-primary font-medium text-sm mb-2">
                    <span className="uppercase tracking-wider">{activeLesson.type} Lesson</span>
                  </div>
                  <h2 className="text-3xl font-display font-bold text-foreground">{activeLesson.title}</h2>
                </div>

                {/* Content Renderer */}
                <div className="prose prose-slate max-w-none">
                  {activeLesson.type === 'video' && activeLesson.contentUrl && (
                    <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl mb-8 relative group">
                      {/* 
                            In a real app, this would be a Video Player component.
                            For now, we use an iframe or placeholder.
                        */}
                      <iframe
                        src={activeLesson.contentUrl}
                        className="w-full h-full"
                        title={activeLesson.title}
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                    </div>
                  )}

                  {activeLesson.type === 'text' && (
                    <div className="text-lg leading-relaxed text-slate-700 whitespace-pre-wrap">
                      {activeLesson.textContent || (
                        <p className="text-muted-foreground italic">No text content available.</p>
                      )}
                    </div>
                  )}

                  {activeLesson.type === 'pdf' && (
                    <div className="flex items-center gap-4 p-6 bg-muted/20 border border-border rounded-xl">
                      <div className="p-4 bg-red-100 text-red-600 rounded-lg">
                        <FileText size={32} />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">Lesson Document</h4>
                        <p className="text-sm text-muted-foreground mb-2">PDF Resource</p>
                        <a href={activeLesson.contentUrl || "#"} target="_blank" rel="noopener noreferrer">
                          <button className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                            Download / View <Download size={14} />
                          </button>
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-10 border-t border-border mt-10">
                  {/* Previous Button Placeholder */}
                  <div />

                  <Button
                    size="lg"
                    onClick={handleToggleComplete}
                    disabled={toggleCompletion.isPending}
                    variant={isCurrentLessonCompleted ? "outline" : "default"}
                    className={cn("gap-2 shadow-lg transition-all", isCurrentLessonCompleted && "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800")}
                  >
                    {toggleCompletion.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isCurrentLessonCompleted ? (
                      <>Completed <Check size={18} /></>
                    ) : (
                      <>Mark as Complete <CheckCircle size={18} /></>
                    )}
                  </Button>
                </div>

                {/* Lesson Discussion / Q&A */}
                <LessonDiscussion lessonId={activeLesson.id} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground min-h-[50vh]">
                <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                  <PlayCircle size={32} className="opacity-50" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Ready to Start Learning?</h3>
                <p>Select a lesson from the sidebar to begin.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
