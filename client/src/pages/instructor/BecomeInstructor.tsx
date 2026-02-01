
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, Clock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import Forbidden from "@/pages/forbidden";

const requestSchema = z.object({
    bio: z.string().min(20, "Message must be at least 20 characters long"),
    linkedinUrl: z.string().optional().or(z.literal("")),
});

export default function BecomeInstructor() {
    const { user } = useAuth();
    const { toast } = useToast();

    const form = useForm({
        resolver: zodResolver(requestSchema),
        defaultValues: {
            bio: "",
            linkedinUrl: "",
        },
    });

    // Check existing request status
    // We don't have a specific endpoint for "my request status" yet, but create endpoint checks validation.
    // Best UX: We should have an endpoint or use 'user.role' check. 
    // If user.role is 'approval_pending' (not implemented) or check via separate API.
    // For now, let's just blindly submit OR add a query if we were thorough.
    // To keep it simple as per plan: Post and handle logic.

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await apiRequest("POST", "/api/instructor-requests", data);
            return res.json();
        },
        onSuccess: () => {
            toast({
                title: "Request Sent",
                description: "We will contact you shortly.",
            });
            // Optionally re-fetch something?
        },
        onError: (error: any) => {
            toast({
                title: "Submission Failed",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    if (user?.organizationId) {
        return <Forbidden />;
    }

    if (user?.role === "instructor" || user?.role === "org_admin" || user?.role === "super_admin") {
        return (
            <DashboardLayout>
                <div className="max-w-2xl mx-auto py-12 text-center">
                    <div className="flex justify-center mb-4">
                        <CheckCircle className="w-16 h-16 text-green-500" />
                    </div>
                    <h1 className="text-3xl font-bold mb-4">You are already an Instructor</h1>
                    <p className="text-muted-foreground mb-8">
                        Navigate to your Instructor Dashboard to manage courses.
                    </p>
                    <Link href="/instructor-dashboard">
                        <Button>Go to Instructor Dashboard</Button>
                    </Link>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold font-display">Join Our Instructor Team</h1>
                    <p className="text-muted-foreground mt-2">
                        Independent instructors can publish courses on our marketplace.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-10">
                    <div className="bg-primary/5 p-6 rounded-lg border border-primary/10">
                        <h3 className="font-semibold text-lg mb-2 text-primary">Why Teach With Us?</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 mt-0.5 text-primary" />
                                <span>Reach thousands of students globally.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 mt-0.5 text-primary" />
                                <span>Flexible tools to create video, text, and PDF lessons.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 mt-0.5 text-primary" />
                                <span>Track student progress and analytics.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-muted p-6 rounded-lg border border-border">
                        <h3 className="font-semibold text-lg mb-2">How it works</h3>
                        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                            <li>Submit your interest using the form below.</li>
                            <li>Our team will review your profile and contact you.</li>
                            <li>Once approved, you'll get access to the Instructor Dashboard.</li>
                            <li>Start creating and publishing your courses!</li>
                        </ol>
                    </div>
                </div>

                {mutation.isSuccess ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
                        <div className="flex justify-center mb-4">
                            <Clock className="w-12 h-12 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-green-800 mb-2">Request Received</h2>
                        <p className="text-green-700">
                            Thanks for your interest! We have received your message and will be in touch soon.
                        </p>
                    </div>
                ) : (
                    <div className="bg-white p-6 rounded-lg border border-border shadow-sm">
                        <h2 className="text-xl font-bold mb-4">Request Contact</h2>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6">

                                <FormField
                                    control={form.control}
                                    name="bio"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Message / Bios</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Tell us about yourself and what you'd like to teach..."
                                                    className="min-h-[120px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <div className="text-xs text-muted-foreground">Please include any relevant experience or links to your work.</div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="linkedinUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>LinkedIn Profile / Portfolio (Optional)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="https://linkedin.com/in/yourprofile" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" className="w-full" disabled={mutation.isPending}>
                                    {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Send Request
                                </Button>
                            </form>
                        </Form>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
