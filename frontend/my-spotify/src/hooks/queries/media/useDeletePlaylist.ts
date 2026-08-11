import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePlaylist } from "@/services/mediaService";

export function useDeletePlaylist(playlistId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => deletePlaylist(playlistId),

        onSuccess: () => {
            queryClient.removeQueries({
                queryKey: ["playlists", playlistId],
            });

            // queryClient.invalidateQueries({
            //     queryKey: ["playlists"],
            // });

            queryClient.invalidateQueries({
                queryKey: ["user-playlists"],
            });
        },
    });
}