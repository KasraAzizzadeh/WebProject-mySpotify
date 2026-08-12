import { ArtistApplicationTicket, SupportTicketLocal, TicketMessage, TicketStatus, AuditingRecord, AnalyticsData, SubscriptionTier } from "@/types";
import { getMediaUrl } from "@/services/api";

const SUBSCRIPTION_FEATURES = {
  basic: [
    { text: 'Daily stream limit: 60', included: true },
    { text: 'Playlist limit: 6', included: true },
    { text: 'Add profile picture', included: false },
    { text: 'Download songs', included: false },
    { text: 'Early access to new songs', included: false },
    { text: 'View song stats & analytics', included: false },
  ],
  silver: [
    { text: 'Unlimited daily streaming', included: true },
    { text: 'Playlist limit: 100', included: true },
    { text: 'Add profile picture', included: true },
    { text: 'Download songs', included: true },
    { text: 'Early access to new songs', included: false },
    { text: 'View song stats & analytics', included: false },
  ],
  gold: [
    { text: 'Unlimited daily streaming', included: true },
    { text: 'Unlimited playlist layout', included: true },
    { text: 'Add profile picture', included: true },
    { text: 'Download songs', included: true },
    { text: 'Early access to new songs', included: true },
    { text: 'View song stats & analytics', included: true },
  ],
};

export const statusStyles = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
};

export function mapArtistApplicationTicket(data: Record<string, unknown>): ArtistApplicationTicket {
  const samples = Array.isArray(data.samples)
    ? data.samples.map((sample) => {
        const sampleUrl = typeof sample === "string" ? sample : String(sample ?? "");
        return getMediaUrl(sampleUrl) ?? sampleUrl;
      })
    : [];

  return {
    id: String(data.id ?? ""),
    userId: String(data.userId ?? data.user_id ?? ""),
    email: String(data.email ?? ""),
    artisticName: String(data.artisticName ?? data.artistic_name ?? ""),
    samples,
    verificationStatus: String(data.verificationStatus ?? data.verification_status ?? "pending") as ArtistApplicationTicket['verificationStatus'],
    submittedAt: data.submittedAt
      ? new Date(String(data.submittedAt))
      : data.submitted_at
      ? new Date(String(data.submitted_at))
      : new Date(),
  };
}

export function mapSupportTicketMessage(data: Record<string, unknown>): TicketMessage {
  return {
    id: String(data.id ?? ""),
    senderId: String(data.senderId ?? data.sender_id ?? ""),
    senderName: String(data.senderName ?? data.sender_name ?? ""),
    senderRole: String(data.senderRole ?? data.sender_role ?? "user") as TicketMessage['senderRole'],
    content: String(data.content ?? ""),
    timestamp: String(data.timestamp ?? data.createdAt ?? data.created_at ?? ""),
  };
}

export function mapSupportTicket(data: Record<string, unknown>): SupportTicketLocal {
  const statusValue = String(data.status ?? "Open");
  const status = statusValue.charAt(0).toUpperCase() + statusValue.slice(1).toLowerCase();

  return {
    id: String(data.id ?? ""),
    username: String(data.username ?? data.senderUsername ?? data.sender_username ?? ""),
    subject: String(data.subject ?? ""),
    dateSubmitted: String(data.dateSubmitted ?? data.submittedAt ?? data.submitted_at ?? ""),
    status: status as TicketStatus,
    messages: Array.isArray(data.messages)
      ? data.messages.map((message) => mapSupportTicketMessage(message as Record<string, unknown>))
      : [],
  };
}

export function mapAuditingRecord(data: Record<string, unknown>): AuditingRecord {
  const artist = data.artist as Record<string, unknown> | undefined;

  return {
    id: String(data.id ?? ""),
    artistId: String(data.artistId ?? data.artist_id ?? artist?.id ?? ""),
    artistName: String(data.artistName ?? data.artist_name ?? ""),
    uniqueListeners: Number(data.uniqueListeners ?? data.unique_listeners ?? 0),
    totalStreams: Number(data.totalStreams ?? data.total_streams ?? 0),
    calculatedReward: Number(data.calculatedReward ?? data.calculated_reward ?? 0),
    paymentStatus: String(data.paymentStatus ?? data.payment_status ?? "Pending Payment") as AuditingRecord['paymentStatus'],
  };
}

export function mapAnalyticsData(data: Record<string, unknown>): AnalyticsData {
  return {
    totalUsers: Number(data.totalUsers ?? data.total_users ?? 0),
    activePremiumUsers: Number(data.activePremiumUsers ?? data.active_premium_users ?? 0),
    monthlyGrossRevenue: Number(data.monthlyGrossRevenue ?? data.monthly_gross_revenue ?? 0),
    distribution: Array.isArray(data.distribution)
      ? data.distribution.map((item) => ({
          tier: String(item.tier ?? "Unknown"),
          count: Number(item.count ?? 0),
          percentage: Number(item.percentage ?? 0),
          color: String(item.color ?? ""),
        }))
      : [],
  };
}

export function mapSubscriptionTier(data: Record<string, unknown>): SubscriptionTier {
  const name = String(data.name ?? data.id ?? "").toLowerCase();
  
  let id: 'basic' | 'silver' | 'gold' = 'basic';
  if (name === 'silver' || name === 'gold') {
    id = name;
  }
  
  return {
    id,
    name: String(data.name ?? ""),
    price: `$${Number(data.price ?? 0).toFixed(2)}`,
    period: "mo" as const,
    features: SUBSCRIPTION_FEATURES[id],
  };
}
