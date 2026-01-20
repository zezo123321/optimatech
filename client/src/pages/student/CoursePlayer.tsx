import { useParams, Link } from "wouter";
import { useCourse } from "@/hooks/use-courses";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Loader2, ChevronLeft, CheckCircle, Circle, PlayCircle, FileText, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Lesson, Module } from "@shared/schema";

export default function CoursePlayer() {
  const { id } = useParams<{ id: string }>();
  const { data: course, isLoading } = useCourse(Number(id));
  
  const [activeModuleId, setActiveModuleId] = useState<number | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    if (course?.modules?.[0]) {
      setActiveModuleId(course.modules[0].id);
      if (course.modules[0].lessons?.[0]) {
        setActiveLesson(course.modules[0].lessons[0]);
      }
    }
  }, [course]);

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
          <h1 className="font-display font-bold text-lg truncate max-w-md" title={course.title}>
            {course.title}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Progress</span>
            <span className="text-sm font-bold text-primary">35% Completed</span>
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
              {course.modules.map((module) => (
                <div key={module.id} className="space-y-2">
                  <div className="font-medium text-sm text-foreground px-2">
                    {module.title}
                  </div>
                  <div className="space-y-1">
                    {module.lessons.map((lesson) => {
                      const isActive = activeLesson?.id === lesson.id;
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => setActiveLesson(lesson)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors text-left",
                            isActive 
                              ? "bg-primary/10 text-primary font-medium" 
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
                          {isActive ? (
                            <PlayCircle size={16} className="flex-shrink-0" />
                          ) : (
                            <Circle size={16} className="flex-shrink-0 opacity-50" />
                          )}
                          <span className="truncate">{lesson.title}</span>
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
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="border-b border-border pb-6">
                  <div className="flex items-center gap-2 text-primary font-medium text-sm mb-2">
                    <span className="uppercase tracking-wider">{activeLesson.type} Lesson</span>
                  </div>
                  <h2 className="text-3xl font-display font-bold text-foreground">{activeLesson.title}</h2>
                </div>

                {/* Content Renderer */}
                <div className="prose prose-blue max-w-none">
                  {activeLesson.type === 'video' && activeLesson.contentUrl && (
                    <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl mb-8 relative group">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <PlayCircle size={64} className="text-white opacity-80 group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      <img 
                        src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1600&auto=format&fit=crop&q=80" 
                        alt="Video Placeholder" 
                        className="w-full h-full object-cover opacity-50"
                      />
                      {/* Real video player implementation would go here */}
                    </div>
                  )}

                  {activeLesson.type === 'text' && (
                    <div className="text-lg leading-relaxed text-slate-700">
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
                        <p className="text-sm text-muted-foreground mb-2">PDF Resource • 2.4 MB</p>
                        <button className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                          Download <Download size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-10 border-t border-border mt-10">
                  <button className="px-6 py-3 rounded-xl border border-border text-muted-foreground font-medium hover:bg-muted transition-colors">
                    Previous Lesson
                  </button>
                  <button className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all flex items-center gap-2">
                    Mark as Complete <CheckCircle size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <BookOpen size={48} className="mb-4 opacity-20" />
                <p>Select a lesson from the sidebar to start learning.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
