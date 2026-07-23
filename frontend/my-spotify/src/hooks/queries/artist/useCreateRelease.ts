import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createRelease } from "@/services/manageService";

import { UserProfile } from "@/types";
import { ReleaseFormState } from "@/components/manage/ReleaseForm";

export function useCreateRelease() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      dbUser,
      formData,
    }: {
      dbUser: UserProfile;
      formData: ReleaseFormState;
    }) => createRelease(dbUser, formData),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["artistDashboard", variables.dbUser.id],
      });
    },
  });
}