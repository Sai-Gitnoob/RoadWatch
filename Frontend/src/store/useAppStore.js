import { create } from 'zustand';

const useAppStore = create((set) => ({
  // Auth
  currentUser: null,
  token: localStorage.getItem('roadwatch-token') || null,
  isAuthenticated: !!localStorage.getItem('roadwatch-token'),
  
  login: (userData, token) => {
    localStorage.setItem('roadwatch-token', token);
    set({
      currentUser: userData,
      token: token,
      isAuthenticated: true
    });
  },
  
  logout: () => {
    localStorage.removeItem('roadwatch-token');
    set({
      currentUser: null,
      token: null,
      isAuthenticated: false
    });
  },
  
  setCurrentUser: (userData) => set({ currentUser: userData }),

  // Map state
  selectedRoad: null,
  setSelectedRoad: (road) => set({ selectedRoad: road }),
  clearSelectedRoad: () => set({ selectedRoad: null }),

  // Complaints
  complaints: [],
  addComplaint: (complaint) =>
    set((state) => ({ complaints: [complaint, ...state.complaints] })),

  // Chat history
  chatMessages: (() => {
    try {
      const saved = sessionStorage.getItem('roadwatch-chat-history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  })(),
  addChatMessage: (msg) =>
    set((state) => {
      const newMessages = [...state.chatMessages, msg].slice(-50);
      try {
        sessionStorage.setItem('roadwatch-chat-history', JSON.stringify(newMessages));
      } catch (e) {
        console.error("Could not save chat history to sessionStorage", e);
      }
      return { chatMessages: newMessages };
    }),
  clearChat: () => {
    sessionStorage.removeItem('roadwatch-chat-history');
    set({ chatMessages: [] });
  },

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
