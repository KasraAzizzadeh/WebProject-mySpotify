import { ArtistApplicationTicket } from "@/types";
import { getMediaUrl } from "@/services/api";

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
