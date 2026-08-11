import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeSongFromPlaylist } from "@/services/mediaService";

export function useRemovePlaylistSong(playlistId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (songId: string) =>
            removeSongFromPlaylist(songId, playlistId!),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["playlist", playlistId],
            });

            queryClient.invalidateQueries({
                queryKey: ["playlist-songs", playlistId],
            });

            queryClient.invalidateQueries({
                queryKey: ["user-playlists"],
            });
        },
    });
}