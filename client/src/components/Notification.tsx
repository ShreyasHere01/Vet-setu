import { useEffect } from "react";
import { Bell, X } from "lucide-react";
import { useNotificationStore } from "../store/notificationStore";

export default function Notification() {
  const message = useNotificationStore(
    (state) => state.message
  );

  const clearNotification = useNotificationStore(
    (state) => state.clearNotification
  );

  useEffect(() => {
    if (!message) {
      return;
    }

    const timer = setTimeout(() => {
      clearNotification();
    }, 4000);

    return () => {
      clearTimeout(timer);
    };
  }, [message, clearNotification]);

  if (!message) {
    return null;
  }

  return (
    <div className="fixed right-5 top-5 z-50 flex max-w-sm items-center gap-3 rounded-xl border border-[#B8DDE3] bg-white px-4 py-3.5 text-[#1F2937] shadow-lg">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E8F5F7] text-[#0D5E72]">
        <Bell size={18} />
      </div>

      <p className="flex-1 text-sm font-medium">
        {message}
      </p>

      <button
        type="button"
        onClick={clearNotification}
        className="shrink-0 rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
        aria-label="Close notification"
      >
        <X size={18} />
      </button>
    </div>
  );
}