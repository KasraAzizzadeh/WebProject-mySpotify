'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { userService } from '@/services/userService';
import { UserProfile, SongItem, AlbumItem } from '@/types';

// Modular Components
import ProfileCard from '@/components/profile/ProfileCard';
import ProfileStats from '@/components/profile/ProfileStats';
import ProfileDetails from '@/components/profile/ProfileDetails';
import ProfileDiscography from '@/components/profile/ProfileDiscography';

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const searchParams = useSearchParams();
  
  const targetUserId = searchParams.get('id') || authUser?.id;
  const isOwnProfile = authUser?.id === targetUserId;
  
  const [dbUser, setDbUser] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  
  // Form Track States
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [bioText, setBioText] = useState('');

  // 1. Fetch Profile Data via Service
  useEffect(() => {
    let isMounted = true;

    async function fetchProfile() {
      if (!targetUserId) return;
      
      try {
        const freshUser = await userService.getUserProfile(targetUserId);
        
        if (isMounted && freshUser) {
          setDbUser(freshUser);
          setDisplayName(freshUser.displayName);
          setEmail(freshUser.email);
          setBioText(freshUser.artistProfile?.bio || '');
          
          if (authUser?.id) {
            const followerList = freshUser.followers || [];
            setIsFollowing(followerList.includes(authUser.id));
          }
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      }
    }

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [targetUserId, authUser?.id]);

  // 2. Handle Canceling Edits
  const handleCancelEdit = () => {
    if (dbUser) {
      setDisplayName(dbUser.displayName);
      setEmail(dbUser.email);
      setBioText(dbUser.artistProfile?.bio || '');
    }
    setIsEditing(false);
  };

  // 3. Handle Saving Profile
  const handleSaveProfile = async () => {
    if (!dbUser || !targetUserId) return;
    
    setIsSaving(true);
    try {
      const updates: Partial<UserProfile> = {
        displayName,
        email,
      };

      if (dbUser.role === 'artist') {
        updates.artistProfile = {
          ...dbUser.artistProfile!,
          bio: bioText,
        };
      }

      await userService.updateUserProfile(targetUserId, updates);
      
      setDbUser({ ...dbUser, ...updates } as UserProfile);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!dbUser) {
    return (
      <div className="h-screen flex items-center justify-center text-neutral-500 text-sm tracking-wide">
        Loading profile data...
      </div>
    );
  }

  const followersCount = dbUser.followers?.length || 0;
  const followingCount = dbUser.following?.length || 0;
  const dailyStreams = 142;
  const totalStreams = dbUser.artistProfile?.totalStreams || 0;
  const shouldShowDailyStreams = isOwnProfile || dbUser.role === 'listener';

  const mockArtistSongs: SongItem[] = [
    { id: 's1', title: 'Midnight Pulse', artistName: dbUser.displayName, artistId: dbUser.id, listeners: 1200000, releaseDate: '2026-06-01' },
    { id: 's3', title: 'Cosmic Drift', artistName: dbUser.displayName, artistId: dbUser.id, listeners: 45000, releaseDate: '2026-02-10' }
  ];

  const mockArtistAlbums: AlbumItem[] = [
    { id: 'a1', name: 'Neon Horizon', artistName: dbUser.displayName, artistId: dbUser.id, listeners: 2500000, releaseDate: '2026-04-15' }
  ];

  return (
    <main className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      
      <ProfileCard 
        dbUser={dbUser}
        isOwnProfile={isOwnProfile}
        isEditing={isEditing}
        isSaving={isSaving}
        isFollowing={isFollowing}
        setIsEditing={setIsEditing}
        setIsFollowing={setIsFollowing}
        handleCancelEdit={handleCancelEdit}
        handleSaveProfile={handleSaveProfile}
      />

      <ProfileStats 
        dbUser={dbUser}
        followersCount={followersCount}
        followingCount={followingCount}
        totalStreams={totalStreams}
        dailyStreams={dailyStreams}
        shouldShowDailyStreams={shouldShowDailyStreams}
      />

      <ProfileDetails 
        dbUser={dbUser}
        isOwnProfile={isOwnProfile}
        isEditing={isEditing}
        isSaving={isSaving}
        displayName={displayName}
        setDisplayName={setDisplayName}
        email={email}
        setEmail={setEmail}
        bioText={bioText}
        setBioText={setBioText}
      />

      {dbUser.role === 'artist' && (
        <ProfileDiscography 
          subscriptionType={dbUser.subscriptionType} 
          mockArtistSongs={mockArtistSongs} 
          mockArtistAlbums={mockArtistAlbums}
        />
      )}
      
    </main>
  );
}