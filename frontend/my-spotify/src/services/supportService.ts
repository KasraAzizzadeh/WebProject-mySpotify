import { userService } from "./userService";
import { ArtistApplicationTicket } from "@/types";
import { getApplicaitonTickets, saveApplicationTickets, getNotifications, saveNotifications, User } from "@/store/mockDb";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getApplications = async (
    page: number, limit: number
) : Promise<ArtistApplicationTicket[]> => {
    await delay(100);

    const allApplications = getApplicaitonTickets();

    const start = (page - 1) * limit;
    const end = start + limit;

    return allApplications.slice(start, end);
}

export const updateApplication = async (
    id: string, status: "approved" | "rejected", message: string
): Promise<void> => {
    await delay(100);

    // Update application
    const applications = getApplicaitonTickets();

    const application = applications.find(app => app.id === id);

    if (!application) {
        throw new Error("Application not found");
    }

    const updatedApplications = applications.map(app =>
        app.id === id
        ? { ...app, verificationStatus: status }
        : app
    );

    saveApplicationTickets(updatedApplications);

    // Update user
    const user = await userService.getUserProfile(application.userId);

    if (!user || !user.artistProfile) {
    throw new Error("Artist profile not found");
    }

    const updates: Partial<User> = {
        artistProfile: {
            ...user.artistProfile,
            verificationStatus: status,
        },
    };

    if (status === "approved") {
    updates.role = "artist";
    updates.displayName = application.artisticName;
    }

    await userService.updateUserProfile(application.userId, updates);

    // Notification
    const notifications = getNotifications();

    notifications.push({
        id: crypto.randomUUID(),
        userId: application.userId,
        content:
        status === "approved"
            ? "Congratulations! Your artist application has been approved."
            : `Your artist application has been rejected for the following reason:\n ${message}`,
        status: "unread",
    });

    saveNotifications(notifications);
};