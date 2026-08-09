import { useQuery } from "@tanstack/react-query";
import { getUserPlaylists } from "@/services/mediaService";

export function useUserPlaylist(userId: string | undefined) {
    return useQuery({
        queryKey: ["user-playlists", userId],
        queryFn: () => getUserPlaylists(userId!),
        enabled: !!userId,
    })
}