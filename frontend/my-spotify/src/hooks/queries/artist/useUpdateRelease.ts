import { useMutation, useQueryClient } from "@tanstack/react-query";

import { AlbumItem } from "@/types";
import { TrackEditData } from "@/components/music/EditAlbumModal";

import { updateRelease } from "@/services/manageService";

export function useUpdateRelease() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      release,
      image,
      tracks,
    }: {
      release: AlbumItem;
      image?: File;
      tracks?: TrackEditData[];
    }) =>
      updateRelease(
        release,
        image,
        tracks
      ),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["artistDashboard", variables.release.artistId],
      });
    },
  });
}