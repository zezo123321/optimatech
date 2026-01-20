import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type GradeSubmission, type InsertSubmission } from "@shared/schema";

export function useMyEnrollments() {
  return useQuery({
    queryKey: [api.enrollments.my.path],
    queryFn: async () => {
      const res = await fetch(api.enrollments.my.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch enrollments");
      return api.enrollments.my.responses[200].parse(await res.json());
    },
  });
}

export function useEnroll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ courseId, userId }: { courseId: number; userId: number }) => {
      const url = buildUrl(api.enrollments.create.path, { courseId });
      const res = await fetch(url, {
        method: api.enrollments.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to enroll");
      return api.enrollments.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.enrollments.my.path] });
    },
  });
}

export function useSubmissions(assignmentId: number) {
  return useQuery({
    queryKey: [api.submissions.list.path, assignmentId],
    queryFn: async () => {
      const url = buildUrl(api.submissions.list.path, { assignmentId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch submissions");
      return api.submissions.list.responses[200].parse(await res.json());
    },
    enabled: !!assignmentId,
  });
}

export function useSubmitAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ assignmentId, ...data }: { assignmentId: number } & Omit<InsertSubmission, "assignmentId" | "studentId">) => {
      const url = buildUrl(api.submissions.create.path, { assignmentId });
      const res = await fetch(url, {
        method: api.submissions.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to submit assignment");
      return api.submissions.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.submissions.list.path, variables.assignmentId] });
    },
  });
}

export function useGradeSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & GradeSubmission) => {
      const url = buildUrl(api.submissions.grade.path, { id });
      const res = await fetch(url, {
        method: api.submissions.grade.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to grade submission");
      return api.submissions.grade.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.submissions.list.path] });
    },
  });
}
