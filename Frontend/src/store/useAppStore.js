import { create } from 'zustand';

const useAppStore = create((set) => ({
  // Auth
  currentUser: {
    uid: 'demo-user-001',
    name: 'Saloni Gurav',
    email: 'saloni@roadwatch.in',
    avatar: null,
    joinedDate: '2024-10-01',
  },

  // Map state
  selectedRoad: null,
  setSelectedRoad: (road) => set({ selectedRoad: road }),
  clearSelectedRoad: () => set({ selectedRoad: null }),

  // Complaints
  complaints: [],
  addComplaint: (complaint) =>
    set((state) => ({ complaints: [complaint, ...state.complaints] })),

  // Chat history
  chatMessages: [],
  addChatMessage: (msg) =>
    set((state) => ({
      chatMessages: [...state.chatMessages, msg].slice(-50),
    })),
  clearChat: () => set({ chatMessages: [] }),

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
