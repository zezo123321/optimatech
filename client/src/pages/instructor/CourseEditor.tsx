import { useParams } from "wouter";
import { useCourse, useCreateModule, useCreateLesson } from "@/hooks/use-courses";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Plus, Save, BookOpen, FileText, Video, Trash2, GripVertical, Users, Settings, Layout } from "lucide-react";
import { Link } from "wouter";
import { Switch } from "@/components/ui/switch";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CourseTeam from "@/components/instructor/CourseTeam";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/use-permissions";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";

export default function CourseEditor({ id: propId }: { id?: string }) {
    const { id: paramsId } = useParams();
    const { user } = useAuth();
    const { canOnCourse } = usePermissions();

    // Fallback: Try to parse generic ID from URL if all else fails
    const pathParts = window.location.pathname.split("/");
    const urlId = pathParts.includes('edit') ? pathParts[pathParts.indexOf('edit') - 1] : pathParts.pop();

    const id = propId || paramsId || ((urlId && !isNaN(parseInt(urlId))) ? urlId : "0");
    const courseId = parseInt(id);

    // Call all hooks at the top level
    const { data: course, isLoading: isLoadingCourse, isError, error } = useCourse(courseId) as any;
    const createModule = useCreateModule();
    const createLesson = useCreateLesson();
    const { toast } = useToast();

    // Fetch Staff to determine my role
    const { data: staff } = useQuery<(User & { role: string })[]>({
        queryKey: [`/api/courses/${courseId}/staff`],
        enabled: !!courseId
    });

    const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);
    const [isLessonDialogOpen, setIsLessonDialogOpen] = useState<number | null>(null);

    const queryClient = useQueryClient();

    // Form states
    const [moduleTitle, setModuleTitle] = useState("");
    const [lessonTitle, setLessonTitle] = useState("");
    const [lessonContent, setLessonContent] = useState("");
    const [lessonType, setLessonType] = useState("text");

    // Course Details State
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [thumbnailUrl, setThumbnailUrl] = useState("");
    const [published, setPublished] = useState(false);
    const [isPublic, setIsPublic] = useState(false);

    // IP Guard: Check if user is B2B (has organizationId)
    const isB2BUser = !!user?.organizationId;

    useEffect(() => {
        if (course) {
            setTitle(course.title);
            setDescription(course.description || "");
            setThumbnailUrl(course.thumbnailUrl || "");
            setPublished(course.published || false);
            setIsPublic(course.isPublic || false);
        }
    }, [course]);

    // Update Course Mutation
    const updateCourseMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch(`/api/courses/${courseId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Failed to update course");
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Course updated successfully" });
            queryClient.invalidateQueries({ queryKey: [`/api/courses/${courseId}`] });
        },
        onError: () => {
            toast({ title: "Update failed", variant: "destructive" });
        }
    });

    const handleSaveCourse = () => {
        updateCourseMutation.mutate({
            title,
            description,
            thumbnailUrl,
            published
        });
    };

    // Determine Permission Context
    const getMyCourseRole = () => {
        if (!user || !course) return undefined;
        if (user.id === course.instructorId) return "instructor"; // Owner
        const myStaffEntry = staff?.find(s => s.id === user.id);
        return myStaffEntry?.role;
    };

    const myRole = getMyCourseRole();
    const canEdit = canOnCourse("edit", myRole);
    const canManageTeam = canOnCourse("manage_team", myRole);

    const handleCreateModule = () => {
        if (!moduleTitle) return;
        createModule.mutate({
            courseId,
            title: moduleTitle,
            order: (course?.modules?.length || 0) + 1
        }, {
            onSuccess: () => {
                setIsModuleDialogOpen(false);
                setModuleTitle("");
                toast({ title: "Module Created" });
            }
        });
    };

    const handleCreateLesson = (moduleId: number) => {
        if (!lessonTitle) return;

        let payload: any = {
            courseId,
            moduleId,
            title: lessonTitle,
            type: lessonType,
            order: 1,
            published: true
        };

        if (lessonType === "video" || lessonType === "pdf") {
            payload.contentUrl = lessonContent;
        } else {
            payload.textContent = lessonContent;
        }

        createLesson.mutate(payload, {
            onSuccess: () => {
                setIsLessonDialogOpen(null);
                setLessonTitle("");
                setLessonContent("");
                setLessonType("text");
                toast({ title: "Lesson Created" });
            }
        });
    };

    if (isLoadingCourse) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (isError || !course) {
        return (
            <div className="flex flex-col items-center justify-center p-12">
                <h1 className="text-2xl font-bold text-destructive mb-4">Course not found</h1>
                <Link href="/instructor-dashboard"><Button>Return to Dashboard</Button></Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="container mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/instructor-dashboard">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-3xl font-display font-bold">Edit Course</h1>
                        <p className="text-muted-foreground">{course.title}</p>
                    </div>
                    {canEdit && (
                        <div className="flex items-center gap-2">
                            <Link href={`/learn/${courseId}`}>
                                <Button variant="outline">
                                    <BookOpen className="mr-2 h-4 w-4" />
                                    View Course
                                </Button>
                            </Link>

                            <Button variant="default" onClick={handleSaveCourse} disabled={updateCourseMutation.isPending}>
                                <Save className="mr-2 h-4 w-4" />
                                {updateCourseMutation.isPending ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    )}
                </div>

                <Tabs defaultValue="content" className="w-full">
                    <TabsList className="mb-8">
                        <TabsTrigger value="content" className="flex items-center gap-2">
                            <Layout className="w-4 h-4" /> Content
                        </TabsTrigger>
                        {canManageTeam && (
                            <TabsTrigger value="team" className="flex items-center gap-2">
                                <Users className="w-4 h-4" /> Team
                            </TabsTrigger>
                        )}
                        <TabsTrigger value="settings" className="flex items-center gap-2">
                            <Settings className="w-4 h-4" /> Settings
                        </TabsTrigger>
                    </TabsList>

                    {/* CONTENT TAB */}
                    <TabsContent value="content" className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Course Content</h2>

                            {canEdit && (
                                <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button size="sm">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Module
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add New Module</DialogTitle>
                                            <DialogDescription>Create a new section for your course.</DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="module-title">Module Title</Label>
                                                <Input id="module-title" value={moduleTitle} onChange={(e) => setModuleTitle(e.target.value)} placeholder="e.g. Introduction" />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsModuleDialogOpen(false)}>Cancel</Button>
                                            <Button onClick={handleCreateModule} disabled={createModule.isPending}>
                                                {createModule.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Create Module
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>

                        {/* Module List */}
                        {(!course.modules || course.modules.length === 0) ? (
                            <Card className="border-dashed bg-muted/50">
                                <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                                    <p className="text-muted-foreground mb-4">No content yet.</p>
                                    {canEdit && (
                                        <Button variant="secondary" onClick={() => setIsModuleDialogOpen(true)}>Add your first module</Button>
                                    )}
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-6">
                                {course.modules.sort((a: any, b: any) => a.order - b.order).map((module: any) => (
                                    <Card key={module.id} className="relative">
                                        <CardHeader className="bg-muted/30 pb-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                                                    <CardTitle className="text-lg">{module.title}</CardTitle>
                                                </div>
                                                {canEdit && (
                                                    <Dialog open={isLessonDialogOpen === module.id} onOpenChange={(open) => setIsLessonDialogOpen(open ? module.id : null)}>
                                                        <DialogTrigger asChild>
                                                            <Button variant="ghost" size="sm">
                                                                <Plus className="h-4 w-4 mr-1" /> Add Lesson
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>Add Lesson to "{module.title}"</DialogTitle>
                                                            </DialogHeader>
                                                            <div className="grid gap-4 py-4">
                                                                <div className="grid gap-2">
                                                                    <Label>Lesson Title</Label>
                                                                    <Input value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} placeholder="e.g. Setting up the environment" />
                                                                </div>
                                                                <div className="grid gap-2">
                                                                    <Label>Lesson Type</Label>
                                                                    <Select value={lessonType} onValueChange={setLessonType}>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Select type" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="text">Text / Article</SelectItem>
                                                                            <SelectItem value="video">Video (YouTube/URL)</SelectItem>
                                                                            <SelectItem value="pdf">PDF Document</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                                <div className="grid gap-2">
                                                                    <Label>
                                                                        {lessonType === "video" ? "Video File (or URL)" :
                                                                            lessonType === "pdf" ? "PDF File (or URL)" :
                                                                                "Content (Markdown)"}
                                                                    </Label>
                                                                    {lessonType === "text" ? (
                                                                        <Textarea
                                                                            value={lessonContent}
                                                                            onChange={(e) => setLessonContent(e.target.value)}
                                                                            placeholder="Write your lesson content here using Markdown..."
                                                                            className="min-h-[150px] font-mono"
                                                                        />
                                                                    ) : (
                                                                        <div className="space-y-2">
                                                                            <Input
                                                                                type="file"
                                                                                accept={lessonType === "video" ? "video/*" : "application/pdf"}
                                                                                onChange={async (e) => {
                                                                                    const file = e.target.files?.[0];
                                                                                    if (!file) return;

                                                                                    const formData = new FormData();
                                                                                    formData.append("file", file);

                                                                                    try {
                                                                                        toast({ title: "Uploading..." });
                                                                                        const res = await fetch("/api/upload", {
                                                                                            method: "POST",
                                                                                            body: formData
                                                                                        });
                                                                                        if (!res.ok) {
                                                                                            const errorText = await res.text();
                                                                                            throw new Error(`Upload failed: ${res.status} ${errorText}`);
                                                                                        }
                                                                                        const data = await res.json();
                                                                                        setLessonContent(data.url);
                                                                                        toast({ title: "Upload Complete" });
                                                                                    } catch (err: any) {
                                                                                        console.error("Upload error:", err);
                                                                                        toast({
                                                                                            title: "Upload Failed",
                                                                                            description: err.message || "Something went wrong",
                                                                                            variant: "destructive"
                                                                                        });
                                                                                    }
                                                                                }}
                                                                            />
                                                                            <p className="text-xs text-muted-foreground text-center">OR</p>
                                                                            <Input
                                                                                value={lessonContent}
                                                                                onChange={(e) => setLessonContent(e.target.value)}
                                                                                placeholder={lessonType === "video" ? "https://youtube.com/..." : "https://example.com/document.pdf"}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <DialogFooter>
                                                                <Button onClick={() => handleCreateLesson(module.id)} disabled={createLesson.isPending}>Create Lesson</Button>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-4 space-y-2">
                                            {module.lessons && module.lessons.length > 0 ? (
                                                module.lessons.sort((a: any, b: any) => a.order - b.order).map((lesson: any) => (
                                                    <div key={lesson.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 border border-transparent hover:border-border transition-colors group">
                                                        <div className="flex items-center gap-3">
                                                            {lesson.type === "video" ? (
                                                                <Video className="h-4 w-4 text-orange-500" />
                                                            ) : lesson.type === "pdf" ? (
                                                                <BookOpen className="h-4 w-4 text-purple-500" />
                                                            ) : (
                                                                <FileText className="h-4 w-4 text-blue-500" />
                                                            )}
                                                            <span className="text-sm font-medium">{lesson.title}</span>
                                                        </div>
                                                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {canEdit && (
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-sm text-muted-foreground py-2 italic text-center">No lessons in this module</div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* TEAM TAB - Only visible if canManageTeam is checked above (in trigger) but also protect content */}
                    {canManageTeam && (
                        <TabsContent value="team">
                            <CourseTeam courseId={courseId} />
                        </TabsContent>
                    )}

                    {/* SETTINGS TAB */}
                    <TabsContent value="settings">
                        <Card>
                            <CardHeader>
                                <CardTitle>Course Details</CardTitle>
                                <CardDescription>Update high-level course information.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Title</Label>
                                    <Input value={title} onChange={(e) => setTitle(e.target.value)} disabled={!canEdit} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[100px]" disabled={!canEdit} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Thumbnail URL</Label>
                                    <Input value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} disabled={!canEdit} />
                                </div>

                                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Published</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Make this course visible to students.
                                        </p>
                                    </div>
                                    <Switch
                                        checked={published}
                                        onCheckedChange={setPublished}
                                        disabled={!canEdit}
                                    />
                                </div>

                                <div className={`flex items-start justify-between p-4 border rounded-lg ${isB2BUser ? 'bg-orange-50/50 border-orange-200' : 'bg-muted/50'}`}>
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <Label className="text-base">Marketplace Visibility</Label>
                                            {isB2BUser && <span className="bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded font-medium">B2B Restricted</span>}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {isB2BUser
                                                ? "Corporate accounts cannot publish to the Public Marketplace."
                                                : "Make this course searchable/accessible to all public users."}
                                        </p>
                                    </div>
                                    <Switch
                                        checked={isPublic}
                                        onCheckedChange={setIsPublic}
                                        disabled={!canEdit || isB2BUser} // IP Guard: Disable for B2B
                                    />
                                </div>

                                {canEdit && (
                                    <Button className="w-full" onClick={handleSaveCourse} disabled={updateCourseMutation.isPending}>
                                        <Save className="mr-2 h-4 w-4" />
                                        {updateCourseMutation.isPending ? "Saving..." : "Save Details"}
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
