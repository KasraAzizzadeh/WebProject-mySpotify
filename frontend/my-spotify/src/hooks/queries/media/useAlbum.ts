import { useQuery } from "@tanstack/react-query";
import { getAlbumById } from "@/services/mediaService";

export function useAlbum(albumId: string | undefined) {
    console.log("useAlbum albumId:", albumId);
    return useQuery({
        queryKey: ["albums", albumId],
        queryFn: () => getAlbumById(albumId!),
        enabled: !!albumId,
    })
}