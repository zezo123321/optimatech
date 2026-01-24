import { useQuery, useMutation } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useAdminStats() {
    return useQuery({
        queryKey: [api.admin.stats.path],
        queryFn: async () => {
            const res = await fetch(api.admin.stats.path);
            if (!res.ok) throw new Error("Failed to fetch admin stats");
            return api.admin.stats.responses[200].parse(await res.json());
        },
    });
}

export function useAllUsers() {
    return useQuery({
        queryKey: [api.admin.users.list.path],
        queryFn: async () => {
            const res = await fetch(api.admin.users.list.path);
            if (!res.ok) throw new Error("Failed to fetch users");
            return api.admin.users.list.responses[200].parse(await res.json());
        },
    });
}

export function useUpdateUserRole() {
    const { toast } = useToast();

    return useMutation({
        mutationFn: async ({ userId, role }: { userId: number; role: "student" | "instructor" | "org_admin" | "super_admin" }) => {
            const url = buildUrl(api.admin.users.updateRole.path, { id: userId });
            const res = await fetch(url, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role }),
            });
            if (!res.ok) throw new Error("Failed to update user role");
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [api.admin.users.list.path] });
            toast({
                title: "Role updated",
                description: "User role has been successfully updated.",
            });
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });
}

export function useCreateUser() {
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (data: typeof api.admin.users.create.input._type) => {
            const res = await fetch(api.admin.users.create.path, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Failed to create user");
            }
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [api.admin.users.list.path] });
            toast({
                title: "User Created",
                description: "The user has been successfully created.",
            });
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });
}
