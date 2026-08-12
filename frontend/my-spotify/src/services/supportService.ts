import api, { handleApiError } from "@/services/api";
import { ArtistApplicationTicket, SupportTicketLocal, AuditingRecord, SubscriptionTier, SubscriptionType, AnalyticsData } from "@/types";
import { mapArtistApplicationTicket, mapSupportTicket, mapAuditingRecord, mapAnalyticsData, mapSubscriptionTier } from "@/utils/supportUtils";

// applications
export const getApplications = async (
    page: number, limit: number
) : Promise<ArtistApplicationTicket[]> => {
    try {
        const response = await api.get("/support/applications/");
        const applications = Array.isArray(response.data)
            ? response.data.map(mapArtistApplicationTicket)
            : [];

        const start = (page - 1) * limit;
        return applications.slice(start, start + limit);
    } catch (error) {
        handleApiError(error);
    }
}

export const updateApplication = async (
    id: string, status: "approved" | "rejected", message: string
): Promise<ArtistApplicationTicket> => {
    try {
        const response = await api.patch(`/support/applications/${id}/`, {
            status,
            message,
        });
        return mapArtistApplicationTicket(response.data);
    } catch (error) {
        handleApiError(error);
    }
};

// tickets
export const getTickets = async (
    page: number, limit: number
) : Promise<SupportTicketLocal[]> => {
    try {
        const response = await api.get("/support/questions/");
        const tickets = Array.isArray(response.data)
            ? response.data.map(mapSupportTicket)
            : [];

        const start = (page - 1) * limit;
        return tickets.slice(start, start + limit);
    } catch (error) {
        handleApiError(error);
    }
}

export const getTicketById = async (
  ticketId: string
): Promise<SupportTicketLocal> => {
  try {
    const response = await api.get(`/support/questions/${ticketId}/`);
    return mapSupportTicket(response.data);
  } catch (error) {
    handleApiError(error);
  }
};

export const updateTicket = async (
  ticketId: string,
  reply: {
    senderId: string;
    senderName: string;
    content: string;
  }
): Promise<SupportTicketLocal> => {
  try {
    const response = await api.patch(`/support/questions/${ticketId}/`, {
      message: reply.content,
    });
    return mapSupportTicket(response.data);
  } catch (error) {
    handleApiError(error);
  }
};

// audit records
export const getAudits = async (
    page: number, limit: number
) : Promise<AuditingRecord[]> => {
    try {
        const response = await api.get("/support/audits/");
        const audits = Array.isArray(response.data)
            ? response.data.map(mapAuditingRecord)
            : [];

        const start = (page - 1) * limit;
        return audits.slice(start, start + limit);
    } catch (error) {
        handleApiError(error);
    }
}

export const updateAuditRecord = async (
    recordId: string
) : Promise<AuditingRecord> => {
    try {
        const response = await api.patch(`/support/audits/${recordId}/`);
        return mapAuditingRecord(response.data);
    } catch (error) {
        handleApiError(error);
    }
};

// analytics and subscriptions
export const getUserDistribution = async (): Promise<AnalyticsData> => {
  try {
    const response = await api.get("/support/analytics/");
    return mapAnalyticsData(response.data);
  } catch (error) {
    handleApiError(error);
  }
};

export const getSubscriptionSettings = async (): Promise<SubscriptionTier[]> => {
  try {
    const response = await api.get("/subscriptions/");
    return Array.isArray(response.data)
      ? response.data.map(mapSubscriptionTier)
      : [];
  } catch (error) {
    handleApiError(error);
  }
};

export const updateSubscriptionSettings = async (
  updates: {
    id: SubscriptionType;
    price: string;
  }[]
): Promise<SubscriptionTier[]> => {
  try {
    const payload: Record<string, string> = {};
    updates.forEach(update => {
      const priceValue = update.price.replace("$", "");
      if (update.id === "silver") {
        payload.silver_price = priceValue;
      } else if (update.id === "gold") {
        payload.gold_price = priceValue;
      }
    });

    const response = await api.patch("/subscriptions/", payload);
    return Array.isArray(response.data)
      ? response.data.map(mapSubscriptionTier)
      : [];
  } catch (error) {
    handleApiError(error);
  }
};
