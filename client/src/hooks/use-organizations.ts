import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function useOrganization(slug: string) {
  return useQuery({
    queryKey: [api.organizations.get.path, slug],
    queryFn: async () => {
      const url = buildUrl(api.organizations.get.path, { slug });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch organization");
      return api.organizations.get.responses[200].parse(await res.json());
    },
    enabled: !!slug,
  });
}

export function useOrganizationAnalytics(id: number) {
  return useQuery({
    queryKey: [api.organizations.analytics.path, id],
    queryFn: async () => {
      const url = buildUrl(api.organizations.analytics.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return api.organizations.analytics.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}
