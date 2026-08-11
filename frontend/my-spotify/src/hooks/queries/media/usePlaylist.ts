import { useQuery } from "@tanstack/react-query";
import { getPlaylistById } from "@/services/mediaService";

export function usePlaylist(playlistId: string | undefined) {
    return useQuery({
        queryKey: ["playlists", playlistId],
        queryFn: () => getPlaylistById(playlistId!),
        enabled: !!playlistId,
    })
}