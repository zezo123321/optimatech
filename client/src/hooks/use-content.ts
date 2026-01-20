import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertModule, type InsertLesson } from "@shared/schema";

export function useCreateModule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ courseId, ...data }: { courseId: number } & Omit<InsertModule, "courseId">) => {
      const url = buildUrl(api.modules.create.path, { courseId });
      const res = await fetch(url, {
        method: api.modules.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create module");
      return api.modules.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.courses.get.path, variables.courseId] });
    },
  });
}

export function useCreateLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ moduleId, ...data }: { moduleId: number } & Omit<InsertLesson, "moduleId">) => {
      const url = buildUrl(api.lessons.create.path, { moduleId });
      const res = await fetch(url, {
        method: api.lessons.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create lesson");
      return api.lessons.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      // Invalidate all course queries as we don't know the exact course ID easily here
      // Ideally we'd pass it or look it up
      queryClient.invalidateQueries({ queryKey: [api.courses.get.path] });
    },
  });
}
