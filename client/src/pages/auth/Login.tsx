import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export default function Login() {
  const { user, isLoading, loginMutation } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && user) {
      // Redirect based on role
      if (user.role === "super_admin" || user.role === "org_admin") {
        setLocation("/admin-dashboard");
      } else if (user.role === "instructor") {
        setLocation("/instructor-dashboard");
      } else {
        setLocation("/dashboard");
      }
    }
  }, [user, isLoading, setLocation]);

  const form = useForm({
    resolver: zodResolver(z.object({
      username: z.string().min(1, "Username is required"),
      password: z.string().min(1, "Password is required")
    })),
    defaultValues: {
      username: "",
      password: ""
    }
  });

  const onSubmit = (data: any) => {
    loginMutation.mutate(data, {
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: error.message,
        });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // If we are here, user is not logged in.
  // We can just redirect to the API login endpoint or show a custom button.
  // However, let's create a nice interstitial page.
  /* Login Form State */

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Brand */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1600&auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        {/* <!-- office meeting workspace --> */}

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-primary flex items-center justify-center font-bold text-xl">TL</div>
            <span className="text-2xl font-display font-bold">TadreebLink</span>
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <h2 className="text-5xl font-display font-bold mb-6 leading-tight">
            Elevate your organizations learning culture.
          </h2>
          <p className="text-lg opacity-90 leading-relaxed">
            Join thousands of learners and instructors on the most intuitive LMS platform designed for modern growth.
          </p>
        </div>

        <div className="relative z-10 text-sm opacity-60">
          © 2024 TadreebLink Inc.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-display font-bold text-foreground">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in with your Code and Password</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter your password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full py-6 text-lg font-semibold" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Sign In
              </Button>
            </form>
          </Form>

          <div className="pt-8 border-t border-border text-center space-y-4">
            <p className="text-sm">
              Don't have an account? <a href="/auth/register" className="text-primary hover:underline font-semibold">Sign up</a>
            </p>
            <p className="text-xs text-muted-foreground">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
