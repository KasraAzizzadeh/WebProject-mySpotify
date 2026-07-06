'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { userService } from '@/services/userService';
import { UserProfile, SongItem, AlbumItem } from '@/types';
import { getAlbums, getSongs } from '@/store/mockDb';

// Modular Components
import ProfileCard from '@/components/profile/ProfileCard';
import ProfileStats from '@/components/profile/ProfileStats';
import ProfileDetails from '@/components/profile/ProfileDetails';
import ProfileDiscography from '@/components/profile/ProfileDiscography';
import Message from '@/components/ui/Message';

export default function ProfilePage() {
  const { user: authUser, refreshUser, logoutUser } = useAuth() as any;
  const params = useParams();
  
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

  // 1. Fetch Profile and Sync Real Discography via Database Core
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

          // Hydrate and filter real discography records from local DB storage
          if (freshUser.role === 'artist') {
            const allAlbums = getAlbums();
            const allSongs = getSongs();

            const allowedAlbumIds = freshUser.artistProfile?.albums || [];
            const allowedSingleIds = freshUser.artistProfile?.singles || [];

            // 1. Filter official published albums
            const userAlbums = allAlbums.filter(album => allowedAlbumIds.includes(album.id));
            
            // 2. MODIFIED: Fetch ONLY standalone single tracks belonging directly to the user
            const userSingles = allSongs.filter(song => allowedSingleIds.includes(song.id));

            setArtistAlbums(userAlbums);
            setArtistSongs(userSingles);
          }
        }
      } catch (error) {
        console.error('Failed to fetch user profile or sync discography:', error);
      }
    }

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [targetUserId, authUser?.id]);

  const hasPremiumAvatarPermission = dbUser?.subscriptionType === 'silver' || dbUser?.subscriptionType === 'gold';

  // 2. Direct Instant Upload Handlers
  const handleAvatarDirectUpload = async (file: File) => {
    if (!dbUser || !targetUserId || !hasPremiumAvatarPermission) return;

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        await userService.updateUserProfile(targetUserId, {
          profilePictureUrl: base64String
        });

        setDbUser(prev => prev ? { ...prev, profilePictureUrl: base64String } : null);

        if (refreshUser && isOwnProfile) {
          await refreshUser();
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Failed compiling avatar upload data: ", err);
    }
  };

  const handleAvatarRemoveClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmAvatarRemove = async () => {
    if (!dbUser || !targetUserId || !hasPremiumAvatarPermission) return;

    setIsDeletingPhoto(true);
    try {
      await userService.updateUserProfile(targetUserId, {
        profilePictureUrl: "" 
      });

      setDbUser(prev => prev ? { ...prev, profilePictureUrl: "" } : null);

      if (refreshUser && isOwnProfile) {
        await refreshUser();
      }
    } catch (err) {
      console.error("Failed removing profile avatar photo: ", err);
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
  
  // Calculate total streams based strictly on standalone track items
  const totalStreams = dbUser.role === 'artist' 
    ? artistSongs.reduce((sum, song) => sum + (song.streams || 0), 0) 
    : 0;

  const shouldShowDailyStreams = isOwnProfile || dbUser.role === 'listener';

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
        setIsEditing={setIsEditing}
        handleCancelEdit={handleCancelEdit}
        handleSaveProfile={handleSaveProfile}
      />

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