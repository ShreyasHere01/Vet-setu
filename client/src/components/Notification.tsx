import { useEffect } from "react";
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
    <div className="fixed right-5 top-5 z-50 rounded-lg bg-green-600 px-5 py-3 text-white shadow-lg">
      {message}
    </div>
  );
}