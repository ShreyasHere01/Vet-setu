import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export default function ProtectedRoute({
  allowedRoles,
}: ProtectedRouteProps) {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  const [hasHydrated, setHasHydrated] = useState(
    useAuthStore.persist.hasHydrated()
  );

  useEffect(() => {
    if (hasHydrated) {
      return;
    }

    const unsubscribe =
      useAuthStore.persist.onFinishHydration(() => {
        setHasHydrated(true);
      });

    return unsubscribe;
  }, [hasHydrated]);

  // Wait for Zustand to restore persisted auth state
  if (!hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FBF7]">
        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#0D5E72]" />

          <p className="mt-4 text-sm text-gray-500">
            Loading...
          </p>

        </div>
      </div>
    );
  }

  // Only check authentication AFTER hydration
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in, but wrong role
  if (
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}