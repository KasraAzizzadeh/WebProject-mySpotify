import { DashboardData, UserProfile } from '@/types';

// Mocking a Gold Listener profile for UI demonstration
export async function getCurrentUser(): Promise<UserProfile> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: 'user-123',
        username: 'jam_session99',
        displayName: 'Alex Carter',
        profilePictureUrl: undefined, // Simulates fallback verification
        role: 'listener',
        subscriptionType: 'gold', // Change to 'basic' or 'silver' to test variants
      });
    }, 100);
  });
}

export async function getDashboardData(subscriptionType: SubscriptionType): Promise<DashboardData> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const baseData: DashboardData = {
        recentlyPlayed: [
          { id: 'p1', name: 'Chill Lo-Fi Beats', trackCount: 42 },
          { id: 'p2', name: 'Coding Session Intensity', trackCount: 18 },
        ],
        trendingSongs: [
          { id: 's1', title: 'Midnight Pulse', artistName: 'Neon Horizon', albumName: 'Synth City' },
          { id: 's2', title: 'Ethereal Echoes', artistName: 'Luna Eclipse' },
        ],
        recentAlbums: [
          { id: 'a1', name: 'Velvet Dreams', artistName: 'The Soft Tones' },
          { id: 'a2', name: 'Hyperdrive', artistName: 'Glitch Fox' },
        ],
      };

      // Phase 2 Preparation: Conditional injection of early access data
      if (subscriptionType === 'gold') {
        baseData.earlyAccess = [
          { id: 'ea1', name: 'Unreleased Track Catalyst', artistName: 'DJ Prototype' },
        ];
      }

      resolve(baseData);
    }, 100);
  });
}