import { useQuery } from "@tanstack/react-query";
import { discoverAlbums } from "@/services/mediaService";
import { DiscoverFilter } from "@/types";

export function useDiscoverAlbums(query: string, filter: DiscoverFilter) {
    return useQuery({
        queryKey: ["albums", "discover", query, filter],
        queryFn: () => discoverAlbums(query, filter),
        staleTime: 10 * 1000 * 60,
    });
}