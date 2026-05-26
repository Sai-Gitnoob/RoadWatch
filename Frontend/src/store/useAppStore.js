import { create } from 'zustand';
import { complaintService } from '../services/complaintService';

const useAppStore = create((set) => ({
  // Auth
  currentUser: null,
  token: localStorage.getItem('roadwatch-token') || null,
  isAuthenticated: !!localStorage.getItem('roadwatch-token'),
  
  login: (userData, token) => {
    localStorage.setItem('roadwatch-token', token);
    const userChatKey = `roadwatch-chat-history-${userData?.uid || 'default'}`;
    let loadedChat = [];
    try {
      const saved = sessionStorage.getItem(userChatKey);
      if (saved) loadedChat = JSON.parse(saved);
    } catch (e) {}

    set({
      currentUser: userData,
      token: token,
      isAuthenticated: true,
      chatMessages: loadedChat
    });
  },
  
  logout: () => {
    localStorage.removeItem('roadwatch-token');
    set({
      currentUser: null,
      token: null,
      isAuthenticated: false,
      chatMessages: [],
      complaints: [],
      selectedRoad: null
    });
  },
  
  setCurrentUser: (userData) => {
    const userChatKey = `roadwatch-chat-history-${userData?.uid || 'default'}`;
    let loadedChat = [];
    try {
      const saved = sessionStorage.getItem(userChatKey);
      if (saved) loadedChat = JSON.parse(saved);
    } catch (e) {}
    set({ currentUser: userData, chatMessages: loadedChat });
  },

  // Map state
  selectedRoad: null,
  setSelectedRoad: (road) => set({ selectedRoad: road }),
  clearSelectedRoad: () => set({ selectedRoad: null }),

  // Complaints
  complaints: [],
  setComplaints: (complaints) => set({ complaints }),
  fetchComplaints: async () => {
    const state = useAppStore.getState();
    if (!state.token) return;
    try {
      const response = await complaintService.getComplaints(state.token);
      if (response.success) {
        // Sort newest first
        const sorted = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        set({ complaints: sorted });
      }
    } catch (error) {
      console.error("Failed to fetch complaints:", error);
    }
  },
  addComplaint: (complaint) =>
    set((state) => ({ complaints: [complaint, ...state.complaints] })),

  // Chat history
  chatMessages: [],
  addChatMessage: (msg) =>
    set((state) => {
      const newMessages = [...state.chatMessages, msg].slice(-50);
      try {
        const userChatKey = `roadwatch-chat-history-${state.currentUser?.uid || 'default'}`;
        sessionStorage.setItem(userChatKey, JSON.stringify(newMessages));
      } catch (e) {
        console.error("Could not save chat history to sessionStorage", e);
      }
      return { chatMessages: newMessages };
    }),
  clearChat: () => set((state) => {
    const userChatKey = `roadwatch-chat-history-${state.currentUser?.uid || 'default'}`;
    sessionStorage.removeItem(userChatKey);
    return { chatMessages: [] };
  }),

  // Notification
  notification: null,
  setNotification: (notif) => {
    set({ notification: notif });
    if (notif) setTimeout(() => set({ notification: null }), 3500);
  },

  // Dark Mode State
  darkMode: localStorage.getItem('roadwatch-dark-mode') === 'true',
  toggleDarkMode: () =>
    set((state) => {
      const nextMode = !state.darkMode;
      localStorage.setItem('roadwatch-dark-mode', String(nextMode));
      return { darkMode: nextMode };
    }),
}));

export default useAppStore;
