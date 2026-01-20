import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

export default function Login() {
  const { user, isLoading } = useAuth();
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // If we are here, user is not logged in.
  // We can just redirect to the API login endpoint or show a custom button.
  // Since Replit Auth handles the UI, we just link to it.
  
  // However, let's create a nice interstitial page.
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

      {/* Right Side - Login CTA */}
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-display font-bold text-foreground">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to your account to continue</p>
          </div>

          <a 
            href="/api/login"
            className="w-full block py-4 px-6 rounded-xl bg-primary text-primary-foreground font-semibold text-lg shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
          >
            Sign In with Replit Auth
          </a>

          <div className="pt-8 border-t border-border">
            <p className="text-xs text-muted-foreground">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
