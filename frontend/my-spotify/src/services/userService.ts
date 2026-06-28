import { getUsers, saveUsers, User } from '@/store/mockDb';

// Helper to simulate network latency so your UI can handle real-world loading states
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const userService = {
  /**
   * Fetches a user profile by ID.
   */
  async getUserProfile(userId: string): Promise<User | null> {
    await delay(400); // Simulate network request
    const allUsers: User[] = getUsers();
    const user = allUsers.find((u) => u.id === userId);
    
    return user || null;
  },

  /**
   * Placeholder for future implementations (e.g., Follow/Edit)
   * You can build these out as you connect the edit/follow buttons!
   */
  async updateUserProfile(userId: string, updates: Partial<User>): Promise<void> {
    await delay(400);
    const allUsers = getUsers();
    const index = allUsers.findIndex((u) => u.id === userId);
    
    if (index !== -1) {
      allUsers[index] = { ...allUsers[index], ...updates };
      saveUsers(allUsers);
    }
  }
};