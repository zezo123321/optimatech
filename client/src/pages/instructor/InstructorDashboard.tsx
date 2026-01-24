import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useCourses, useCreateCourse } from "@/hooks/use-courses";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link } from "wouter";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, BookOpen, Users, BarChart3, MoreVertical, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const createCourseSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    thumbnailUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
});

type CreateCourseValues = z.infer<typeof createCourseSchema>;

export default function InstructorDashboard() {
    const { user, logout } = useAuth();
    const { data: courses, isLoading, error, isError } = useCourses() as any;
    const { mutate: createCourse, isPending: isCreating } = useCreateCourse();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();

    const form = useForm<CreateCourseValues>({
        resolver: zodResolver(createCourseSchema),
        defaultValues: {
            title: "",
            description: "",
            thumbnailUrl: "",
        },
    });

    const onSubmit = (data: CreateCourseValues) => {
        createCourse(
            {
                ...data,
                thumbnailUrl: data.thumbnailUrl || undefined,
                organizationId: user?.organizationId || 0, // Fallback, likely won't be used due to backend override
                published: false,
            } as any,
            {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    form.reset();
                    toast({
                        title: "Course Created",
                        description: "Your new course has been created successfully.",
                    });
                },
                onError: (error) => {
                    toast({
                        title: "Error",
                        description: error.message,
                        variant: "destructive",
                    });
                },
            }
        );
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex h-screen items-center justify-center flex-col">
                <h2 className="text-xl font-bold text-destructive">Error Loading Courses</h2>
                <pre className="text-sm bg-muted p-4 mt-2 rounded">{JSON.stringify(error, null, 2)}</pre>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="container mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-display font-bold">Instructor Dashboard</h1>
                        <p className="text-muted-foreground">
                            Welcome back, {user?.name || "Instructor"}. Here's an overview of your courses.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => logout()}>Logout</Button>
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="lg" className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" />
                                    Create Course
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create New Course</DialogTitle>
                                    <DialogDescription>
                                        Start by giving your course a title and description. You can add content later.
                                    </DialogDescription>
                                </DialogHeader>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="title"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Course Title</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g. Advanced Project Management" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Description</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Brief summary of what students will learn..."
                                                            className="resize-none min-h-[100px]"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <DialogFooter>
                                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                            <Button type="submit" disabled={isCreating}>
                                                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Create Course
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{courses?.length || 0}</div>
                            <p className="text-xs text-muted-foreground">Active courses</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">--</div>
                            <p className="text-xs text-muted-foreground">Enrolled across all courses</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">--</div>
                            <p className="text-xs text-muted-foreground">Based on student feedback</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Courses List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">My Courses</h2>
                    {courses?.length === 0 ? (
                        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
                            <div className="rounded-full bg-primary/10 p-4 mb-4">
                                <BookOpen className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
                            <p className="text-muted-foreground mb-4 max-w-sm">
                                You haven't created any courses yet. Click the button above to get started.
                            </p>
                            <Button onClick={() => setIsDialogOpen(true)}>Create Course</Button>
                        </Card>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {courses?.map((course: any) => (
                                <Card key={course.id} className="group overflow-hidden hover:shadow-lg transition-all duration-200">
                                    <div className="aspect-video w-full bg-muted relative">
                                        {course.thumbnailUrl ? (
                                            <img
                                                src={course.thumbnailUrl}
                                                alt={course.title}
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-secondary/50">
                                                <BookOpen className="h-12 w-12 text-muted-foreground/20" />
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2 flex gap-1">
                                            <div className={`px-2 py-1 rounded-full text-xs font-semibold ${course.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {course.published ? 'Published' : 'Draft'}
                                            </div>
                                        </div>
                                    </div>
                                    <CardHeader>
                                        <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                                        <CardDescription className="line-clamp-2 min-h-[40px]">
                                            {course.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between pt-4 border-t border-border">
                                            <div className="text-sm text-muted-foreground">
                                                {/* placeholder for module count */}
                                                Modules: --
                                            </div>
                                            <Link href={`/courses/${course.id}/edit`}>
                                                <Button variant="outline" size="sm" className="gap-2">
                                                    <Pencil className="h-3 w-3" />
                                                    Edit
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
