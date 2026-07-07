import { getUsers, saveUsers, User, 
  getSupportTickets, saveSupportTickets,
  getNotifications, saveNotifications } from '@/store/mockDb';

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
  },

  async submitTicket (userId: string, question: string ): Promise<void> {
    await delay(100);

    const users = getUsers();
    const user = users.find(u => u.id === userId);

    if (!user) {
      throw new Error("User doesn't exist");
    }

    const tickets = getSupportTickets();

    const now = new Date();

    tickets.unshift({
      id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      username: user.username,
      subject:
        question.length > 50
          ? `${question.slice(0, 50)}...`
          : question,
      dateSubmitted: now.toISOString().split("T")[0],
      status: "Open",
      messages: [
        {
          id: crypto.randomUUID(),
          senderId: user.id,
          senderName: user.username,
          senderRole: "user",
          content: question,
          timestamp: now.toLocaleString(),
        },
      ],
    });

    saveSupportTickets(tickets);

    // Notify all admins and supporters
    const notifications = getNotifications();

    users
      .filter(
        u => u.role === "admin" || u.role === "supporter"
      )
      .forEach(staff => {
        notifications.push({
          id: crypto.randomUUID(),
          userId: staff.id,
          content: `New support ticket submitted by ${user.username}.`,
          status: "unread",
          type: "ST",
          createdAt: new Date()
        });
      });

    saveNotifications(notifications);
  }
};