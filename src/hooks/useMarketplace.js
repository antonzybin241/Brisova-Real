import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";

export function useFeaturedProperties() {
  return useQuery({
    queryKey: ["properties", "featured"],
    queryFn: () => api.getFeaturedProperties(),
    staleTime: 60_000,
  });
}

export function useProperties(filters) {
  return useQuery({
    queryKey: ["properties", filters],
    queryFn: () => api.getProperties(filters),
    staleTime: 30_000,
  });
}

export function useProperty(id) {
  return useQuery({
    queryKey: ["property", id],
    queryFn: () => api.getProperty(id),
    enabled: Boolean(id),
  });
}

export function useDashboard(wallet) {
  return useQuery({
    queryKey: ["dashboard", wallet],
    queryFn: () => api.getDashboard(wallet),
    enabled: Boolean(wallet),
  });
}

export function useProfile(wallet) {
  return useQuery({
    queryKey: ["profile", wallet],
    queryFn: () => api.getProfile(wallet),
    enabled: Boolean(wallet),
  });
}

export function useInvestments(wallet) {
  return useQuery({
    queryKey: ["investments", wallet],
    queryFn: () => api.getInvestments(wallet),
    enabled: Boolean(wallet),
  });
}
