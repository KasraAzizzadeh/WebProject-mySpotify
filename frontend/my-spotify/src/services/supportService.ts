import { userService } from "./userService";
import { ArtistApplicationTicket, SupportTicketLocal, TicketMessage, 
    AuditingRecord, SubscriptionTier, SubscriptionType } from "@/types";
import { getApplicaitonTickets, saveApplicationTickets, 
    getNotifications, saveNotifications,
    getSupportTickets, saveSupportTickets,
    getAuditingRecords, saveAuditingRecords,
    getSubscriptions, saveSubscriptions,
    getUsers, User } from "@/store/mockDb";

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
        type: "AA",
        createdAt: new Date()
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
    type: "AQ",
    createdAt: new Date()
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
        type: "AT",
        createdAt: new Date()
    });

    saveNotifications(notifications);
}

// Admin specific info
export const getUserDistribution = async () => {
  await delay(100);

  const users = getUsers();
  const subscriptions = getSubscriptions();

  const basic = users.filter(u => u.subscriptionType === "basic").length;
  const silver = users.filter(u => u.subscriptionType === "silver").length;
  const gold = users.filter(u => u.subscriptionType === "gold").length;

  const total = users.length;

  const silverPrice = parseFloat(
    subscriptions.find(t => t.id === "silver")?.price.replace("$", "") ?? "0"
  );

  const goldPrice = parseFloat(
    subscriptions.find(t => t.id === "gold")?.price.replace("$", "") ?? "0"
  );

  return {
    totalUsers: total,

    activePremiumUsers: silver + gold,

    monthlyGrossRevenue:
      silver * silverPrice +
      gold * goldPrice,

    distribution: [
      {
        tier: "Free Tier",
        count: basic,
        percentage: total ? Math.round((basic / total) * 100) : 0,
        color: "bg-neutral-700",
      },
      {
        tier: "Silver Premium",
        count: silver,
        percentage: total ? Math.round((silver / total) * 100) : 0,
        color: "bg-neutral-400",
      },
      {
        tier: "Gold Premium",
        count: gold,
        percentage: total ? Math.round((gold / total) * 100) : 0,
        color: "bg-yellow-500",
      },
    ],
  };
};

export const getSubscriptionSettings = async (): Promise<SubscriptionTier[]> => {
  await delay(100);

  return getSubscriptions();
};

export const updateSubscriptionSettings = async (
  updates: {
    id: SubscriptionType;
    price: string;
  }[]
): Promise<void> => {
  await delay(100);

  const subscriptions = getSubscriptions();

  const updatedSubscriptions = subscriptions.map(sub => {
    const update = updates.find(u => u.id === sub.id);

    if (!update) return sub;

    return {
      ...sub,
      price: update.price,
    };
  });

  saveSubscriptions(updatedSubscriptions);
};
