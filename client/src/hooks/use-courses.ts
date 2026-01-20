import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertCourse } from "@shared/schema";

export function useCourses(organizationId?: number) {
  return useQuery({
    queryKey: [api.courses.list.path, organizationId],
    queryFn: async () => {
      const url = api.courses.list.path + (organizationId ? `?organizationId=${organizationId}` : "");
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch courses");
      return api.courses.list.responses[200].parse(await res.json());
    },
  });
}

export function useCourse(id: number) {
  return useQuery({
    queryKey: [api.courses.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.courses.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch course");
      return api.courses.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertCourse) => {
      const res = await fetch(api.courses.create.path, {
        method: api.courses.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create course");
      return api.courses.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.courses.list.path] });
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertCourse>) => {
      const url = buildUrl(api.courses.update.path, { id });
      const res = await fetch(url, {
        method: api.courses.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update course");
      return api.courses.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.courses.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.courses.get.path, variables.id] });
    },
  });
}
