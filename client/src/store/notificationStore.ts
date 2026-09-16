import { create } from "zustand";

interface NotificationState {
  message: string;
  showNotification: (message: string) => void;
  clearNotification: () => void;
}

export const useNotificationStore =
  create<NotificationState>((set) => ({
    message: "",

    showNotification: (message) => {
      set({ message });
    },

    clearNotification: () => {
      set({ message: "" });
    },
  }));