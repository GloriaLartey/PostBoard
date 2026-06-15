import { useQuery } from "@tanstack/react-query";
import api from "../api/axios"; // your configured axios instance


/**
 * Fetch all users (excluding self) from GET /api/users
 * @param {string}  search   - optional search term
 * @param {boolean} enabled  - only fetch when true (e.g. modal is open)
 */
export const useUsers = (search = "", enabled = true) => {
  return useQuery({
    queryKey: ["users", search],
    queryFn:  async () => {
      const params = { limit: 100 };
      if (search) params.search = search;
      const { data } = await api.get("/api/users", { params });
      return data;
    },
    enabled,
    staleTime: 1000 * 60 * 2, // 2 min cache
    retry: 1,
  });
};