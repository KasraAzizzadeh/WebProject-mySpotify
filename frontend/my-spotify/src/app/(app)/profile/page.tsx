'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import Avatar from '@/components/ui/Avatar';

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  // Fallback loading state while context hydrates
  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center text-neutral-500 text-sm tracking-wide">
        Loading profile data...
      </div>
    );
  }

  // Mocking derived stats for the UI until we wire up the full listener/artist activity tracking
  const followingCount = user.listenerProfile?.followingArtists?.length || 24;
  const followersCount = user.role === 'artist' ? (user.artistProfile?.followersCount || 0) : 15;
  const dailyStreams = 142; // Mocked daily streaming statistic

  return (
    <main className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      
      {/* Header Section */}
      <section className="bg-neutral-900/50 border border-neutral-800/60 rounded-3xl p-6 md:p-10 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden backdrop-blur-sm">
        
        {/* Avatar & Edit Overlay */}
        <div className="relative group flex-shrink-0">
          <Avatar src={user.profilePictureUrl} alt={user.displayName} size={120} />
          {isEditing && (
            <div className={`absolute inset-0 flex items-center justify-center rounded-full bg-black/60 transition-opacity ${user.subscriptionType === 'basic' ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-black/80'}`}>
              <span className="text-xs font-semibold text-white text-center px-2">
                {user.subscriptionType === 'basic' ? 'Premium Required' : 'Change Photo'}
              </span>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
            <span className="text-xs uppercase font-bold tracking-widest text-neutral-400">
              {user.role} Profile
            </span>
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-sm uppercase ${
              user.subscriptionType === 'gold' ? 'bg-amber-500 text-black' : 
              user.subscriptionType === 'silver' ? 'bg-gray-300 text-black' : 
              'bg-neutral-700 text-neutral-300'
            }`}>
              {user.subscriptionType}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            {user.displayName}
          </h1>
          <p className="text-neutral-400 font-medium">@{user.username}</p>
        </div>

        {/* Action Button */}
        <div className="w-full md:w-auto flex justify-center mt-4 md:mt-0">
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${
              isEditing 
                ? 'bg-green-500 text-black hover:bg-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]' 
                : 'bg-neutral-800 text-white hover:bg-neutral-700 border border-neutral-700'
            }`}
          >
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </button>
        </div>
      </section>

      {/* Statistics Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-neutral-900/40 border border-neutral-800/50 p-6 rounded-2xl flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white">{followersCount}</span>
          <span className="text-sm font-medium text-neutral-500 uppercase tracking-wider mt-1">Followers</span>
        </div>
        <div className="bg-neutral-900/40 border border-neutral-800/50 p-6 rounded-2xl flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white">{followingCount}</span>
          <span className="text-sm font-medium text-neutral-500 uppercase tracking-wider mt-1">Following</span>
        </div>
        <div className="bg-neutral-900/40 border border-neutral-800/50 p-6 rounded-2xl flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-green-400">{dailyStreams}</span>
          <span className="text-sm font-medium text-neutral-500 uppercase tracking-wider mt-1">Daily Streams</span>
        </div>
      </section>

      {/* Editable Details Form Area */}
      <section className="bg-neutral-900/30 border border-neutral-800/50 p-6 md:p-8 rounded-3xl space-y-6">
        <h2 className="text-xl font-bold text-white mb-4">Personal Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Display Name</label>
            {isEditing ? (
              <input 
                type="text" 
                defaultValue={user.displayName}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors"
              />
            ) : (
              <div className="bg-neutral-950/50 border border-neutral-800/50 rounded-lg px-4 py-3 text-white">
                {user.displayName}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Email Address</label>
            {isEditing ? (
              <input 
                type="email" 
                defaultValue={user.email}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors"
              />
            ) : (
              <div className="bg-neutral-950/50 border border-neutral-800/50 rounded-lg px-4 py-3 text-white">
                {user.email}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">System Username</label>
            <div className="bg-neutral-950/30 border border-neutral-800/30 rounded-lg px-4 py-3 text-neutral-500 cursor-not-allowed">
              {user.username} <span className="text-[10px] ml-2">(Cannot be changed)</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Account Created</label>
            <div className="bg-neutral-950/30 border border-neutral-800/30 rounded-lg px-4 py-3 text-neutral-500 cursor-not-allowed">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}