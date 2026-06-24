import { DashboardData, UserProfile, SubscriptionType } from '@/types';

// Mocking a Gold Listener profile for UI demonstration
export async function getCurrentUser(): Promise<UserProfile> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: 'user-123',
        username: 'jam_session99',
        displayName: 'Alex Carter',
        email: 'alex.carter@gmail.com',
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
          { 
            id: 's1', 
            title: 'Midnight Pulse', 
            artistName: 'Neon Horizon', 
            artistId: 'art-nh2',
            albumName: 'Synth City', 
            albumId: 'alb-sc2',
            listeners: 1200000,
            releaseDate: '2026-06-01'
          },
          { 
            id: 's2', 
            title: 'Ethereal Echoes', 
            artistName: 'Luna Eclipse', 
            artistId: 'art-le3',
            listeners: 85000,
            releaseDate: '2025-12-15'
          },
        ],
        recentAlbums: [
          { 
            id: 'a1', 
            name: 'Velvet Dreams', 
            artistName: 'The Soft Tones', 
            artistId: 'art-st1',
            listeners: 450000,
            releaseDate: '2026-04-12'
          },
          { 
            id: 'a2', 
            name: 'Hyperdrive', 
            artistName: 'Glitch Fox', 
            artistId: 'art-gf4',
            listeners: 890000,
            releaseDate: '2026-05-20'
          },
        ],
      };

      // Phase 2 Preparation: Conditional injection of early access data
      if (subscriptionType === 'gold') {
        baseData.earlyAccess = [
          { 
            id: 'ea1', 
            name: 'Unreleased Track Catalyst', 
            artistName: 'DJ Prototype', 
            artistId: 'art-dp5',
            listeners: 5000,
            releaseDate: '2026-07-01'
          },
        ];
      }

      resolve(baseData);
    }, 100);
  });
}