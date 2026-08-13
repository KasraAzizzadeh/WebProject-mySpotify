import { useQuery } from "@tanstack/react-query";
import { getSongsByAlbumId } from "@/services/mediaService";

export function useAlbumSongs(albumId: string | undefined) {
    return useQuery({
        queryKey: ["album-songs", albumId],
        queryFn: () => getSongsByAlbumId(albumId!),
        enabled: !!albumId,
    })
}