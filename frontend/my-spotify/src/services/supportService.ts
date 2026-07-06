import { userService } from "./userService";
import { ArtistApplicationTicket, SupportTicketLocal, TicketMessage, AuditingRecord } from "@/types";
import { getApplicaitonTickets, saveApplicationTickets, 
    getNotifications, saveNotifications,
    getSupportTickets, saveSupportTickets,
    getAuditingRecords, saveAuditingRecords,
    User } from "@/store/mockDb";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// applications
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

// tickets
export const getTickets = async (
    page: number, limit: number
) : Promise<SupportTicketLocal[]> => {
    await delay(100);

    const allTickets = getSupportTickets();

    const start = (page - 1) * limit;
    const end = start + limit;

    return allTickets.slice(start, end);
}

export const updateTicket = async (
  ticketId: string,
  reply: {
    senderId: string;
    senderName: string;
    content: string;
  }
): Promise<SupportTicketLocal> => {
  await delay(100);

  const tickets = getSupportTickets();

  const supportMessage: TicketMessage = {
    id: crypto.randomUUID(),
    senderId: reply.senderId,
    senderName: reply.senderName,
    senderRole: "support",
    content: reply.content,
    timestamp: new Date().toLocaleString(),
  };

  const updatedTickets = tickets.map(ticket => {
    if (ticket.id !== ticketId) return ticket;

    return {
      ...ticket,
      status: "Replied" as const,
      messages: [...ticket.messages, supportMessage],
    };
  });

  saveSupportTickets(updatedTickets);

  const updated = updatedTickets.find(t => t.id === ticketId)!;

  // Push notification
  const notifications = getNotifications();

  notifications.push({
    id: crypto.randomUUID(),
    userId: updated.messages.find(m => m.senderRole === "user")!.senderId,
    content: `Your support question has been answered.

Question:
${updated.subject}

Reply:
${reply.content}`,
    status: "unread",
  });

  saveNotifications(notifications);

  return updated;
};

// audit records
export const getAudits = async (
    page: number, limit: number
) : Promise<AuditingRecord[]> => {
    await delay(100);

    const allAuditS = getAuditingRecords();

    const start = (page - 1) * limit;
    const end = start + limit;

    return allAuditS.slice(start, end);
}

export const updateAuditRecord = async (
    recordId: string
) : Promise<void> => {
    
    const allAudits = getAuditingRecords();
    
    const updatedAudits = allAudits.map(rec =>
        rec.id === recordId
            ? { ...rec, paymentStatus: 'Settled' as const }
            : rec
    );
    
    saveAuditingRecords(updatedAudits);
    
    const record = updatedAudits.find(a => a.id === recordId)!;

    // Push notification
    const notifications = getNotifications();

    notifications.push({
        id: crypto.randomUUID(),
        userId: record.artistId,
        content: `Your monthly payout has been completed.

Performance Summary
• Total Streams: ${record.totalStreams}
• Unique Listeners: ${record.uniqueListeners}

$${record.calculatedReward.toFixed(2)} has been transferred to your account. Thank you for being part of the platform!`,
        status: "unread",
    });

    saveNotifications(notifications);
}