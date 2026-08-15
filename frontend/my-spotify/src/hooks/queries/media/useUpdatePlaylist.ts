import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePlaylist } from "@/services/mediaService";

export function useUpdatePlaylist(playlistId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (updates: {
            name: string;
            description?: string;
            imageFile?: File;
            isPrivate: boolean;
        }) => updatePlaylist(playlistId, updates),

        onSuccess: (updatedPlaylist) => {
            queryClient.setQueryData(
                ["playlists", playlistId],
                updatedPlaylist
            );
        },
    });
}