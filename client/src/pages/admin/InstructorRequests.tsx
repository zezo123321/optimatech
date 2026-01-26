
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, X, ExternalLink } from "lucide-react";
import { Link } from "wouter";

export default function InstructorRequests() {
    const { toast } = useToast();
    const { data: requests, isLoading } = useQuery<any[]>({
        queryKey: ["/api/admin/instructor-requests"],
    });

    const actionMutation = useMutation({
        mutationFn: async ({ id, action }: { id: number, action: "approve" | "reject" }) => {
            await apiRequest("POST", `/api/admin/instructor-requests/${id}/${action}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/instructor-requests"] });
            toast({ title: "Success", description: "Request processed successfully" });
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    });

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold font-display">Instructor Requests</h1>
                        <p className="text-muted-foreground mt-1">Review and approve instructor applications.</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-border overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Bio</TableHead>
                                <TableHead>LinkedIn</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {requests && requests.length > 0 ? (
                                requests.map((req: any) => (
                                    <TableRow key={req.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-semibold">{req.user.name}</p>
                                                <p className="text-xs text-muted-foreground">{req.user.email}</p>
                                                <p className="text-xs text-muted-foreground">@{req.user.username}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-md">
                                            <p className="text-sm line-clamp-3" title={req.bio}>{req.bio}</p>
                                        </TableCell>
                                        <TableCell>
                                            {req.linkedinUrl ? (
                                                <a
                                                    href={req.linkedinUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center gap-1 text-primary hover:underline text-sm"
                                                >
                                                    Profile <ExternalLink className="w-3 h-3" />
                                                </a>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="default"
                                                    className="bg-green-600 hover:bg-green-700"
                                                    disabled={actionMutation.isPending}
                                                    onClick={() => actionMutation.mutate({ id: req.id, action: "approve" })}
                                                >
                                                    <Check className="w-4 h-4 mr-1" /> Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                                    disabled={actionMutation.isPending}
                                                    onClick={() => actionMutation.mutate({ id: req.id, action: "reject" })}
                                                >
                                                    <X className="w-4 h-4 mr-1" /> Reject
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                                        No pending requests found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </DashboardLayout>
    );
}
