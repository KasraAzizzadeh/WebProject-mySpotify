import { useQuery } from "@tanstack/react-query";
import { getSongsByPlaylistId } from "@/services/mediaService";

export function usePlaylistSongs(playlistId: string | undefined) {
    return useQuery({
        queryKey: ["playlist-songs", playlistId],
        queryFn: () => getSongsByPlaylistId(playlistId!),
        enabled: !!playlistId,
    })
}