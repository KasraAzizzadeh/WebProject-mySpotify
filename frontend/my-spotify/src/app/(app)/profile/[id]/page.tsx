'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { UserProfile, SongItem, AlbumItem } from '@/types';
import { userService } from '@/services/userService';
import { getAlbums, getSongs } from '@/store/mockDb';

import { useUserProfile } from '@/hooks/queries/user/useUserProfile';

// Modular Components
import ProfileCard from '@/components/profile/ProfileCard';
import ProfileStats from '@/components/profile/ProfileStats';
import ProfileDetails from '@/components/profile/ProfileDetails';
import ProfileDiscography from '@/components/profile/ProfileDiscography';
import Message from '@/components/ui/Message';
import Button from '@/components/ui/Button';

export default function ProfilePage() {
  const { user: authUser, refreshUser, logoutUser } = useAuth() as any;
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const targetUserId = (params?.id as string) || authUser?.id;
  const isOwnProfile = authUser?.id === targetUserId;
  
  const [dbUser, setDbUser] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  
  // Real Database Discography States
  const [artistSongs, setArtistSongs] = useState<SongItem[]>([]);
  const [artistAlbums, setArtistAlbums] = useState<AlbumItem[]>([]);
  
  // Modals Confirmation States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isDeletingPhoto, setIsDeletingPhoto] = useState(false);
  
  // Form Track States
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [bioText, setBioText] = useState('');

  // Fetch profile via TanStack Query and hydrate local state
  const {
    data: freshUser,
    isLoading: profileLoading,
    error: profileError,
  } = useUserProfile(targetUserId);

  // When freshUser changes, initialize local state and discography
  useEffect(() => {
    if (!freshUser) return;

    setDbUser(freshUser as UserProfile);
    setDisplayName(freshUser.displayName || '');
    setEmail(freshUser.email || '');
    setBioText(freshUser.artistProfile?.bio || '');

    if (authUser?.id) {
      const followerList = freshUser.followers || [];
      setIsFollowing(followerList.includes(authUser.id));
    }

    if (freshUser.role === 'artist') {
      const allAlbums = getAlbums();
      const allSongs = getSongs();

      const allowedAlbumIds = freshUser.artistProfile?.albums || [];
      const allowedSingleIds = freshUser.artistProfile?.singles || [];

      const userAlbums = allAlbums.filter(album => allowedAlbumIds.includes(album.id));
      const userSingles = allSongs.filter(song => allowedSingleIds.includes(song.id));

      setArtistAlbums(userAlbums);
      setArtistSongs(userSingles);
    }
  }, [freshUser, authUser?.id]);

  const hasPremiumAvatarPermission = dbUser?.subscriptionType === 'silver' || dbUser?.subscriptionType === 'gold';

  // 2. Direct Instant Upload Handlers
  const handleAvatarDirectUpload = async (file: File) => {
    if (!dbUser || !targetUserId || !hasPremiumAvatarPermission) return;

    try {
      const updatedUser = await userService.updateUserProfile(targetUserId, {
        profilePicture: file,
      });

      setDbUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['user-profile', targetUserId] });

      if (refreshUser && isOwnProfile) {
        await refreshUser();
      }
    } catch (err) {
      console.error('Failed uploading profile avatar:', err);
    }
  };

  const handleAvatarRemoveClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmAvatarRemove = async () => {
    if (!dbUser || !targetUserId || !hasPremiumAvatarPermission) return;

    setIsDeletingPhoto(true);
    try {
      const updatedUser = await userService.updateUserProfile(targetUserId, {
        profilePicture: null,
      });

      setDbUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['user-profile', targetUserId] });

      if (refreshUser && isOwnProfile) {
        await refreshUser();
      }
    } catch (err) {
      console.error('Failed removing profile avatar photo:', err);
    } finally {
      setIsDeletingPhoto(false);
      setIsDeleteModalOpen(false);
    }
  };

  // 3. Handle Canceling Edits
  const handleCancelEdit = () => {
    if (dbUser) {
      setDisplayName(dbUser.displayName);
      setEmail(dbUser.email);
      setBioText(dbUser.artistProfile?.bio || '');
    }
    setIsEditing(false);
  };

  // 4. Handle Saving Profile
  const handleSaveProfile = async () => {
    if (!dbUser || !targetUserId) return;

    setIsSaving(true);
    try {
      const updates: Record<string, unknown> = {
        displayName,
        email,
      };

      if (dbUser.role === 'artist') {
        updates.artistProfile = {
          ...dbUser.artistProfile!,
          bio: bioText,
        };
      }

      const updatedUser = await userService.updateUserProfile(targetUserId, updates);
      setDbUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['user-profile', targetUserId] });
      setIsEditing(false);

      if (refreshUser && isOwnProfile) {
        await refreshUser();
      }
    } catch (error) {
      console.error('Failed to save profile details:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // 5. Handle Follow Toggle Functionality
  const handleFollowToggle = async () => {
    if (!authUser || !dbUser || isOwnProfile || followLoading) return;

    setFollowLoading(true);
    try {
      const rawUsers = localStorage.getItem('app_users');
      if (!rawUsers) return;

      const parsedUsers = JSON.parse(rawUsers);

      const targetUserIndex = parsedUsers.findIndex((u: any) => u.id === dbUser.id);
      const authUserIndex = parsedUsers.findIndex((u: any) => u.id === authUser.id);

      if (targetUserIndex === -1 || authUserIndex === -1) return;

      let updatedTargetFollowers = [...(parsedUsers[targetUserIndex].followers || [])];
      let updatedAuthFollowing = [...(parsedUsers[authUserIndex].following || [])];

      if (isFollowing) {
        updatedTargetFollowers = updatedTargetFollowers.filter(id => id !== authUser.id);
        updatedAuthFollowing = updatedAuthFollowing.filter(id => id !== dbUser.id);
      } else {
        if (!updatedTargetFollowers.includes(authUser.id)) updatedTargetFollowers.push(authUser.id);
        if (!updatedAuthFollowing.includes(dbUser.id)) updatedAuthFollowing.push(dbUser.id);
      }

      parsedUsers[targetUserIndex].followers = updatedTargetFollowers;
      parsedUsers[authUserIndex].following = updatedAuthFollowing;
      localStorage.setItem('app_users', JSON.stringify(parsedUsers));

      setDbUser(prev => prev ? { ...prev, followers: updatedTargetFollowers } : null);
      setIsFollowing(!isFollowing);

      if (refreshUser) {
        await refreshUser();
      }
    } catch (err) {
      console.error("Critical issue toggling following metrics: ", err);
    } finally {
      setFollowLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="h-screen flex items-center justify-center text-neutral-500 text-sm tracking-wide">
        Loading profile data...
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="h-screen flex items-center justify-center text-red-400 text-sm tracking-wide">
        Failed to load profile.
      </div>
    );
  }

  if (!dbUser) {
    return (
      <div className="h-screen flex items-center justify-center text-neutral-500 text-sm tracking-wide">
        Loading profile data...
      </div>
    );
  }

  const followersCount = dbUser.followers?.length || 0;
  const followingCount = dbUser.following?.length || 0;
  const shouldShowApplyArtistButton = isOwnProfile && dbUser.role === 'listener' && dbUser.artistProfile?.verificationStatus !== 'pending' && dbUser.artistProfile?.verificationStatus !== 'approved';
  
  // Calculate total streams based strictly on standalone track items
  const totalStreams = dbUser.role === 'artist' 
    ? artistSongs.reduce((sum, song) => sum + (song.streams || 0), 0) 
    : 0;

  return (
    <main className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      
      {/* ProfileCard handles the logout trigger hook */}
      <ProfileCard 
        dbUser={dbUser}
        isOwnProfile={isOwnProfile}
        isFollowing={isFollowing}
        handleFollowToggle={handleFollowToggle}
        followLoading={followLoading}
        hasAvatarPermission={hasPremiumAvatarPermission}
        onAvatarDirectUpload={handleAvatarDirectUpload}
        onAvatarRemove={handleAvatarRemoveClick}
        onLogoutTrigger={() => setIsLogoutModalOpen(true)}
      />

      <ProfileStats 
        dbUser={dbUser}
        followersCount={followersCount}
        followingCount={followingCount}
        totalStreams={totalStreams}
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
        setIsEditing={setIsEditing}
        handleCancelEdit={handleCancelEdit}
        handleSaveProfile={handleSaveProfile}
      />

      {shouldShowApplyArtistButton && (
        <div className="w-full">
          <Button 
            variant="secondary" 
            onClick={() => router.push('/apply-artist')}
            className="border border-neutral-700 bg-neutral-800/80 text-base text-neutral-100 shadow-sm"
          >
            I want to apply as an artist
          </Button>
        </div>
      )}

      {dbUser.role === 'artist' && (
        <ProfileDiscography 
          subscriptionType={dbUser.subscriptionType} 
          mockArtistSongs={artistSongs} 
          mockArtistAlbums={artistAlbums}
        />
      )}

      {/* Confirmation Message Popup for Photo Deletion */}
      <Message 
        isOpen={isDeleteModalOpen}
        title="Delete Profile Picture"
        description="Are you sure you want to delete your profile picture?"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isDangerous={true}
        isLoading={isDeletingPhoto}
        type="confirm"
        onConfirm={handleConfirmAvatarRemove}
        onCancel={() => setIsDeleteModalOpen(false)}
      />

      {/* Confirmation Message Popup for Account Log Out - Destructive Red */}
      <Message
        isOpen={isLogoutModalOpen}
        title="Log Out"
        description="Are you sure you want to log out? You will need to sign in again to access your account."
        confirmLabel="Log Out"
        isDangerous={true}
        onConfirm={logoutUser}
        onCancel={() => setIsLogoutModalOpen(false)}
      />
      
    </main>
  );
}