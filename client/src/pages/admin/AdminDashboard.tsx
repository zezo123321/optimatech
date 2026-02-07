import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useAdminStats, useAllUsers, useUpdateUserRole } from "@/hooks/use-admin";
import { Loader2, TrendingUp, Users, BookOpen, GraduationCap, MoreHorizontal, Shield, FileBarChart, Filter, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { User, Course, Organization } from "@shared/schema";
import { format } from "date-fns";
import { CreateUserDialog } from "./CreateUserDialog";
import { BulkImportDialog } from "./BulkImportDialog";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

// Type definition for report
type ReportItem = {
  user: User;
  course: Course;
  progress: number;
  completed: boolean;
  enrolledAt: string | null;
};

// Hook for reports
function useAdminReports() {
  return useQuery<ReportItem[]>({
    queryKey: ["/api/admin/reports/progress"],
  });
}

function ReportsTab() {
  const { data: reports, isLoading } = useAdminReports();

  if (isLoading) return <div className="py-8"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Training Progress Report</CardTitle>
        <Button variant="outline" size="sm" onClick={() => window.open('/api/admin/reports/export', '_blank')}>
          <FileBarChart className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Enrolled Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports?.map((item, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{item.user.username}</span>
                    <span className="text-xs text-muted-foreground">{item.user.role}</span>
                  </div>
                </TableCell>
                <TableCell>{item.course.title}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-16 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{Math.round(item.progress)}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  {item.completed ? (
                    <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>
                  ) : (
                    <Badge variant="secondary">In Progress</Badge>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm text-right">
                  {item.enrolledAt ? format(new Date(item.enrolledAt), 'MMM d, yyyy') : '-'}
                </TableCell>
              </TableRow>
            ))}
            {reports?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No enrollment data found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const { logout } = useAuth();
  const { data: stats, isLoading: isStatsLoading } = useAdminStats();
  const { data: users, isLoading: isUsersLoading } = useAllUsers();
  const updateRoleMutation = useUpdateUserRole();

  if (isStatsLoading || isUsersLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-800 to-gray-900 p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-white/5 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-80 w-80 rounded-full bg-white/5 blur-3xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-3">
              Admin Dashboard
            </h1>
            <p className="text-gray-300 text-lg max-w-xl leading-relaxed opacity-90">
              Manage users, view platform analytics, and configure organization settings.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => logout()}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white border-0 backdrop-blur-sm"
          >
            Logout
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Users className="w-4 h-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileBarChart className="w-4 h-4" /> Reports
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" /> Branding
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          {/* Stats Grid */}
          {/* Stats Grid */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-4 md:grid-cols-3"
          >
            <motion.div variants={item}>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{stats?.totalUsers || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Across all roles
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={item}>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{stats?.totalCourses || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Active content
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={item}>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Enrollments</CardTitle>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{stats?.totalEnrollments || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Student engagements
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>



          {/* Users Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>User Management</CardTitle>
              <div className="flex gap-2">
                {/* LC Filter Dropdown Placeholder - In real implementation, this would use a state filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="hidden md:flex">
                      <Filter className="mr-2 h-4 w-4" /> Filter by LC
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>All LCs</DropdownMenuItem>
                    <DropdownMenuItem>Cairo</DropdownMenuItem>
                    <DropdownMenuItem>Mansoura</DropdownMenuItem>
                    {/* Dynamic list should go here */}
                  </DropdownMenuContent>
                </DropdownMenu>

                <BulkImportDialog />
                <CreateUserDialog />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell><code className="bg-muted px-1 py-0.5 rounded text-xs">{user.userCode || '-'}</code></TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>
                        <Badge variant={
                          user.role === 'org_admin' || user.role === 'super_admin' ? 'destructive' :
                            user.role === 'instructor' ? 'default' : 'secondary'
                        }>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {user.createdAt ? format(new Date(user.createdAt), 'MMM d, yyyy') : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => updateRoleMutation.mutate({ userId: user.id, role: 'student' })}>
                              Make Student
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateRoleMutation.mutate({ userId: user.id, role: 'instructor' })}>
                              Make Instructor
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateRoleMutation.mutate({ userId: user.id, role: 'org_admin' })} className="text-destructive">
                              <Shield className="mr-2 h-4 w-4" />
                              Make Admin
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <ReportsTab />
        </TabsContent>

        <TabsContent value="settings">
          <OrgSettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function OrgSettingsTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const { data: organization } = useQuery<Organization>({
    queryKey: ["/api/organizations/current"],
    enabled: !!user?.organizationId
  });

  const [formData, setFormData] = useState({
    certificateLogoUrl: "",
    certificateSignatureUrl: "",
    certificateSignerName: "",
    certificateSignerTitle: "",
    certificateTemplateUrl: ""
  });

  useEffect(() => {
    if (organization) {
      setFormData({
        certificateLogoUrl: organization.certificateLogoUrl || "",
        certificateSignatureUrl: organization.certificateSignatureUrl || "",
        certificateSignerName: organization.certificateSignerName || "",
        certificateSignerTitle: organization.certificateSignerTitle || "",
        certificateTemplateUrl: organization.certificateTemplateUrl || ""
      });
    }
  }, [organization]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const res = await apiRequest("PATCH", "/api/organizations/current", formData);
      if (!res.ok) throw new Error("Failed to update");

      // Force refresh user to update organization context in UI
      await queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });

      toast({
        title: "Settings Saved",
        description: "Organization branding updated successfully. New certificates will use these settings.",
      });
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization Branding</CardTitle>
        <div className="text-sm text-muted-foreground">
          Customize your certificate appearance. Assets (Logo, Signature) will be used for all new certificates.
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Organization Logo URL</label>
            <input
              name="certificateLogoUrl"
              value={formData.certificateLogoUrl}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="https://example.com/logo.png"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Digital Signature URL</label>
            <input
              name="certificateSignatureUrl"
              value={formData.certificateSignatureUrl}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="https://example.com/signature.png"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Signer Name</label>
            <input
              name="certificateSignerName"
              value={formData.certificateSignerName}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="e.g. Dr. Ahmed Ali"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Signer Title</label>
            <input
              name="certificateSignerTitle"
              value={formData.certificateSignerTitle}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="e.g. President, IFMSA-Egypt"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Custom Certificate Template URL (Background Image)</label>
          <input
            name="certificateTemplateUrl"
            value={formData.certificateTemplateUrl}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="https://..."
          />
          <p className="text-[0.8rem] text-muted-foreground">
            Optional. Leave empty to use the default <strong>Marble & Gold</strong> premium design.
          </p>
        </div>

        <div className="pt-4">
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Save Branding Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

