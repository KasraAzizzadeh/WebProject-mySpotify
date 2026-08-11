import { useQuery } from "@tanstack/react-query";
import { userService } from "@/services/userService";

export function usePlaylistOwner(
    ownerId: string | undefined,
    currentUserId: string | undefined
) {
    const isCurrentUser = ownerId === currentUserId;

    return useQuery({
        queryKey: ["user-profile", ownerId],
        queryFn: () => userService.getUserProfile(ownerId!),
        enabled: !!ownerId && !isCurrentUser,
    });
}