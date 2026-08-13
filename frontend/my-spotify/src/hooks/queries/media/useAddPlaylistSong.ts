import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addSongToPlaylist } from "@/services/mediaService";

export function useAddSongToPlaylist() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({songId, playlistId,}: 
            {songId: string; playlistId: string;}) => addSongToPlaylist(songId, playlistId),

        onSuccess: (_, { playlistId }) => {
            queryClient.invalidateQueries({
                queryKey: ["playlist-songs", playlistId],
            });

            queryClient.invalidateQueries({
                queryKey: ["playlists", playlistId],
            });
        },
    });
}