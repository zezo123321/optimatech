import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    BookOpen,
    Users,
    LineChart,
    GraduationCap,
    LogOut,
    Menu,
    X
} from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Navbar() {
    const { user, logout } = useAuth();
    const [location] = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const getNavItems = () => {
        switch (user?.role) {
            case "super_admin":
            case "org_admin":
                return [
                    { label: "Overview", href: "/admin-dashboard" },
                    { label: "Courses", href: "/admin/courses" },
                    { label: "Students", href: "/admin/students" },
                    { label: "Analytics", href: "/admin/analytics" },
                ];
            case "instructor":
                return [
                    { label: "Dashboard", href: "/instructor-dashboard" },
                    { label: "My Courses", href: "/instructor/courses" },
                ];
            case "student":
            default:
                const items = [
                    { label: "My Learning", href: "/dashboard" },
                    { label: "Browse", href: "/courses" },
                    { label: "Progress", href: "/progress" },
                ];
                if (!user?.organizationId) {
                    items.push({ label: "Teach", href: "/instructor/become" });
                }
                return items;
        }
    };

    const navItems = getNavItems();

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">

                {/* Logo */}
                <div className="flex items-center gap-2">
                    <Link href={user ? (user.role === 'student' ? '/dashboard' : '/instructor-dashboard') : '/'}>
                        <div className="flex items-center gap-2 cursor-pointer">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                <GraduationCap size={18} />
                            </div>
                            <span className="font-display font-bold text-lg hidden sm:inline-block">
                                Tadreeb<span className="text-primary">Link</span>
                            </span>
                        </div>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-1">
                    {navItems.map((item) => {
                        const isActive = location === item.href;
                        return (
                            <Link key={item.href} href={item.href}>
                                <div
                                    className={cn(
                                        "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer",
                                        isActive
                                            ? "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                    )}
                                >
                                    {item.label}
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Right Side: Profile / Mobile Menu */}
                <div className="flex items-center gap-4">
                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className="flex items-center gap-3 cursor-pointer p-1 pr-3 rounded-full hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50">
                                    <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
                                        <AvatarImage src={`https://ui-avatars.com/api/?name=${user.name}&background=0D8ABC&color=fff`} />
                                        <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="hidden sm:block text-xs text-left">
                                        <p className="font-medium text-foreground">{user.name}</p>
                                        <p className="text-muted-foreground capitalize">{user.role?.replace('_', ' ')}</p>
                                    </div>
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => logout()} className="text-destructive focus:text-destructive">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link href="/auth/login"><Button variant="ghost" size="sm">Log in</Button></Link>
                            <Link href="/auth/register"><Button size="sm">Sign up</Button></Link>
                        </div>
                    )}

                    {/* Mobile Toggle */}
                    <button
                        className="md:hidden p-2 text-muted-foreground hover:text-foreground"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-border bg-background p-4 space-y-2 absolute w-full shadow-lg">
                    {navItems.map((item) => (
                        <Link key={item.href} href={item.href}>
                            <div
                                className="block px-4 py-3 rounded-lg hover:bg-muted text-sm font-medium cursor-pointer"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {item.label}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </nav>
    );
}
