import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Settings,
  LogOut,
  GraduationCap,
  LineChart,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type DashboardLayoutProps = {
  children: ReactNode;
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Define navigation based on role
  const getNavItems = () => {
    switch (user?.role) {
      case "super_admin":
      case "org_admin":
        return [
          { icon: LayoutDashboard, label: "Overview", href: "/admin-dashboard" },
          { icon: BookOpen, label: "Manage Courses", href: "/admin/courses" },
          { icon: Users, label: "Students", href: "/admin/students" },
          { icon: LineChart, label: "Analytics", href: "/admin/analytics" },
        ];
      case "instructor":
        return [
          { icon: LayoutDashboard, label: "Dashboard", href: "/instructor-dashboard" },
          { icon: BookOpen, label: "My Courses", href: "/instructor/courses" },
          { icon: Users, label: "Assignments", href: "/instructor/assignments" },
        ];
      case "student":
      default:
        return [
          { icon: LayoutDashboard, label: "My Learning", href: "/dashboard" },
          { icon: BookOpen, label: "Browse Courses", href: "/courses" },
          { icon: LineChart, label: "My Progress", href: "/progress" },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-primary text-primary-foreground rounded-full shadow-lg"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-card border-r border-border transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
              <GraduationCap size={24} />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-foreground leading-none">Tadreeb<span className="text-primary">Link</span></h1>
              <p className="text-xs text-muted-foreground mt-1 font-medium tracking-wide">LMS PLATFORM</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer group",
                    isActive
                      ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon
                    size={20}
                    className={cn(
                      "transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border bg-muted/30">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {user?.name?.[0] || user?.email?.[0] || "U"}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold truncate text-foreground">{user?.name || "User"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>

          {/* Gamification / XP Bar */}
          {user?.role === "student" && (
            <div className="px-2 mb-4">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-primary">Level {Math.floor((user.xp || 0) / 100) + 1}</span>
                <span className="text-muted-foreground">{(user.xp || 0) % 100} / 100 XP</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${(user.xp || 0) % 100}%` }}
                />
              </div>
            </div>
          )}

          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border bg-background hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30 transition-all text-sm font-medium text-muted-foreground"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-y-auto h-screen bg-muted/20">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
