import { useQuery } from "@tanstack/react-query";
import { discoverSongs } from "@/services/mediaService";
import { DiscoverFilter } from "@/types";

export function useDiscoverSongs(query: string, filter: DiscoverFilter) {
    return useQuery({
        queryKey: ["songs", "discover", query, filter],
        queryFn: () => discoverSongs(query, filter),
        staleTime: 5 * 1000 * 60,
    });
}