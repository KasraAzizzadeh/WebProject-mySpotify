import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPlaylist } from "@/services/mediaService";

export function useCreatePlaylist(userId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createPlaylist,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["user-playlists", userId],
            });
        },
    });
}