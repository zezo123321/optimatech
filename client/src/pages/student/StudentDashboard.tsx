import { Link } from "wouter";
import { DashboardLayout } from "@/components/DashboardLayout";
import { CourseCard } from "@/components/CourseCard";
import { useAuth } from "@/hooks/use-auth";
import { useMyEnrollments } from "@/hooks/use-learning";
import { Loader2, Search } from "lucide-react";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const { data: enrollments, isLoading } = useMyEnrollments();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-500 to-blue-600 p-8 text-white shadow-xl">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-80 w-80 rounded-full bg-white/10 blur-3xl"></div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold mb-3">
                Welcome back, {user?.name?.split(' ')[0]}! 👋
              </h1>
              <p className="text-blue-50 text-lg max-w-xl leading-relaxed opacity-90">
                You're making great progress. Continue your learning journey with Optimatech today.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 min-w-[180px] text-center shadow-lg transform hover:scale-105 transition-transform duration-300">
              <span className="block text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-blue-100">
                {enrollments?.length || 0}
              </span>
              <span className="text-xs text-blue-100 uppercase tracking-widest font-semibold mt-1 block">Active Courses</span>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4">
          <h2 className="text-2xl font-bold text-gray-800">My Courses</h2>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search your courses..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : enrollments && enrollments.length > 0 ? (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {enrollments.map((enrollment) => (
              <motion.div key={enrollment.id} variants={item}>
                <CourseCard
                  course={enrollment.course}
                  progress={enrollment.progress || 0}
                  role="student"
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-border">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
              <Search size={32} />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">No courses found</h3>
            <p className="text-muted-foreground mb-6">You haven't enrolled in any courses yet.</p>
            <Link href="/courses">
              <button className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors">
                Browse Course Catalog
              </button>
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
