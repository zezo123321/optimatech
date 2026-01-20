import { DashboardLayout } from "@/components/DashboardLayout";
import { StatsCard } from "@/components/StatsCard";
import { useAuth } from "@/hooks/use-auth";
import { useOrganization, useOrganizationAnalytics } from "@/hooks/use-organizations";
import { Users, BookOpen, GraduationCap, Award } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Mock data for charts since we don't have a history endpoint yet
const activityData = [
  { name: 'Mon', active: 400 },
  { name: 'Tue', active: 300 },
  { name: 'Wed', active: 550 },
  { name: 'Thu', active: 450 },
  { name: 'Fri', active: 600 },
  { name: 'Sat', active: 200 },
  { name: 'Sun', active: 150 },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  
  // In a real app, we'd get the org ID from the user object properly
  // For now, let's assume org ID 1 or fetch if available
  const orgId = user?.organizationId || 1; 
  
  const { data: analytics, isLoading } = useOrganizationAnalytics(orgId);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome back, {user?.name}. Here's what's happening today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard 
            title="Total Students" 
            value={isLoading ? "..." : analytics?.totalStudents || 0} 
            icon={<Users size={20} />}
            trend="+12%"
            trendUp={true}
          />
          <StatsCard 
            title="Active Courses" 
            value={isLoading ? "..." : analytics?.activeCourses || 0} 
            icon={<BookOpen size={20} />}
          />
          <StatsCard 
            title="Completion Rate" 
            value={isLoading ? "..." : `${analytics?.completionRate || 0}%`} 
            icon={<GraduationCap size={20} />}
            trend="+5%"
            trendUp={true}
          />
          <StatsCard 
            title="Avg. Score" 
            value={isLoading ? "..." : `${analytics?.averageScore || 0}%`} 
            icon={<Award size={20} />}
            trend="-2%"
            trendUp={false}
          />
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-border shadow-sm">
            <h3 className="text-lg font-bold font-display mb-6">Weekly Activity</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar dataKey="active" fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
            <h3 className="text-lg font-bold font-display mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full p-3 text-left rounded-lg bg-muted/50 hover:bg-muted transition-colors border border-transparent hover:border-border font-medium text-sm flex items-center justify-between group">
                Create New Course
                <ArrowRight size={16} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="w-full p-3 text-left rounded-lg bg-muted/50 hover:bg-muted transition-colors border border-transparent hover:border-border font-medium text-sm flex items-center justify-between group">
                Invite Users
                <ArrowRight size={16} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="w-full p-3 text-left rounded-lg bg-muted/50 hover:bg-muted transition-colors border border-transparent hover:border-border font-medium text-sm flex items-center justify-between group">
                Export Reports
                <ArrowRight size={16} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

import { ArrowRight } from "lucide-react";
