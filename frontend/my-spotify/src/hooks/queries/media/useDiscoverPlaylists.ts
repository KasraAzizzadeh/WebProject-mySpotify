import { useQuery } from "@tanstack/react-query";
import { discoverPlaylists } from "@/services/mediaService";
import { DiscoverFilter } from "@/types";

export function useDiscoverPlaylists(query: string, filter: DiscoverFilter) {
    return useQuery({
        queryKey: ["playlists", "discover", query, filter],
        queryFn: () => discoverPlaylists(query, filter),
        staleTime: 10 * 1000 * 60,
    });
}