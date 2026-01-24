import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

import Landing from "@/pages/Landing";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import StudentDashboard from "@/pages/student/StudentDashboard";
import InstructorDashboard from "@/pages/instructor/InstructorDashboard";
import CourseEditor from "@/pages/instructor/CourseEditor";
import CoursePlayer from "@/pages/student/CoursePlayer";
import CoursesPage from "@/pages/student/CoursesPage";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component, allowedRoles }: { component: React.ComponentType, allowedRoles?: string[] }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard if role mismatch
    if (user.role === 'student') return <Redirect to="/dashboard" />;
    if (['instructor', 'ta', 'co-instructor'].includes(user.role)) return <Redirect to="/instructor-dashboard" />;
    if (['admin', 'super_admin', 'org_admin'].includes(user.role)) return <Redirect to="/admin-dashboard" />;
    return <Redirect to="/dashboard" />;
  }

  return <Component />;
}

function Router() {
  const { user, isLoading } = useAuth();

  // Handle root redirection
  const RootComponent = () => {
    if (isLoading) return null;
    if (user) {
      if (user.role === 'student') return <Redirect to="/dashboard" />;
      if (['instructor', 'ta', 'co-instructor'].includes(user.role)) return <Redirect to="/instructor-dashboard" />;
      if (['admin', 'super_admin', 'org_admin'].includes(user.role)) return <Redirect to="/admin-dashboard" />;
      return <Redirect to="/dashboard" />;
    }
    return <Landing />;
  };

  return (
    <Switch>
      <Route path="/" component={RootComponent} />
      <Route path="/auth/login" component={Login} />
      <Route path="/auth/register" component={Register} />

      {/* Admin Routes */}
      <Route path="/admin-dashboard">
        {() => <ProtectedRoute component={AdminDashboard} allowedRoles={['admin', 'super_admin', 'org_admin']} />}
      </Route>

      {/* Instructor Routes */}
      <Route path="/instructor-dashboard">
        {() => <ProtectedRoute component={InstructorDashboard} allowedRoles={['instructor', 'ta', 'co-instructor', 'org_admin']} />}
      </Route>
      <Route path="/courses/:id/edit">
        {(params) => (
          <ProtectedRoute
            allowedRoles={['instructor', 'ta', 'co-instructor', 'org_admin']}
            component={() => <CourseEditor id={params.id} />}
          />
        )}
      </Route>

      {/* Student Routes */}
      <Route path="/dashboard">
        {() => <ProtectedRoute component={StudentDashboard} allowedRoles={['student']} />}
      </Route>

      <Route path="/learn/:id">
        {() => <ProtectedRoute component={CoursePlayer} allowedRoles={['student', 'instructor', 'super_admin', 'org_admin']} />}
      </Route>

      <Route path="/courses">
        {() => <ProtectedRoute component={CoursesPage} allowedRoles={['student']} />}
      </Route>

      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
