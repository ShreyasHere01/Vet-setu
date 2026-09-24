import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  LogOut,
  UserRound,
  LayoutDashboard,
  Stethoscope,
  PawPrint,
  CalendarDays,
  Plus,
  Bell,
  Check,
} from "lucide-react";
import {
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useAuthStore } from "../store/authStore";
import api from "../lib/api";

interface ProfileData {
  name: string;
  photoUrl: string | null;
}

interface Notification {
  id: number;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function Navbar() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [notificationOpen, setNotificationOpen] =
    useState(false);

  const [readNotificationIds, setReadNotificationIds] =
    useState<number[]>([]);

  const desktopNotificationRef =
    useRef<HTMLDivElement>(null);

  const mobileNotificationRef =
    useRef<HTMLDivElement>(null);

  const isVet = user?.role === "VET";
  const isFarmer = user?.role === "FARMER";

  const { data: vetProfile } = useQuery<ProfileData>({
    queryKey: ["vet-profile"],
    queryFn: async () => {
      const response = await api.get("/vets/profile");
      return response.data;
    },
    enabled: !!user && isVet,
  });

  const { data: farmerProfile } = useQuery<ProfileData>({
    queryKey: ["farmer-profile"],
    queryFn: async () => {
      const response = await api.get("/users/profile");
      return response.data;
    },
    enabled: !!user && isFarmer,
  });

  const { data: notifications = [] } =
    useQuery<Notification[]>({
      queryKey: ["notifications"],
      queryFn: async () => {
        const response = await api.get("/notifications");
        return response.data;
      },
      enabled: !!user,
    });

  useEffect(() => {
    const serverReadIds = notifications
      .filter((notification) => notification.read)
      .map((notification) => notification.id);

    setReadNotificationIds((current) => [
      ...new Set([...current, ...serverReadIds]),
    ]);
  }, [notifications]);

  const isNotificationRead = (
    notification: Notification
  ) => {
    return (
      notification.read ||
      readNotificationIds.includes(notification.id)
    );
  };

  const unreadCount = notifications.filter(
    (notification) =>
      !isNotificationRead(notification)
  ).length;

  useEffect(() => {
    if (!notificationOpen) {
      return;
    }

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;

      const clickedDesktop =
        desktopNotificationRef.current?.contains(target);

      const clickedMobile =
        mobileNotificationRef.current?.contains(target);

      if (!clickedDesktop && !clickedMobile) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, [notificationOpen]);

  if (!user) {
    return null;
  }

  const profile = isVet ? vetProfile : farmerProfile;

  const profilePhoto = profile?.photoUrl;
  const profileName = profile?.name || user.name;

  const farmerLinks = [
    {
      name: "Dashboard",
      to: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Find Vets",
      to: "/vets",
      icon: Stethoscope,
    },
    {
      name: "My Animals",
      to: "/animals",
      icon: PawPrint,
    },
    {
      name: "Appointments",
      to: "/appointments",
      icon: CalendarDays,
    },
  ];

  const vetLinks = [
    {
      name: "Dashboard",
      to: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Create Slot",
      to: "/vet/slots/create",
      icon: Plus,
    },
    {
      name: "Appointments",
      to: "/vet/appointments",
      icon: CalendarDays,
    },
  ];

  const links = isVet ? vetLinks : farmerLinks;

  const handleLogout = () => {
    setMobileMenuOpen(false);
    setNotificationOpen(false);
    logout();
    navigate("/login");
  };

  const handleProfileClick = () => {
    setMobileMenuOpen(false);

    if (isVet) {
      navigate("/vet/profile");
    } else {
      navigate("/profile");
    }
  };

  const handleNotificationClick = async (
    notification: Notification
  ) => {
    if (isNotificationRead(notification)) {
      return;
    }

    const notificationId = notification.id;

    setReadNotificationIds((current) => [
      ...current,
      notificationId,
    ]);

    queryClient.setQueryData<Notification[]>(
      ["notifications"],
      (current = []) =>
        current.map((item) =>
          item.id === notificationId
            ? {
                ...item,
                read: true,
              }
            : item
        )
    );

    try {
      await api.patch(
        `/notifications/${notificationId}/read`
      );
    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error
      );

      setReadNotificationIds((current) =>
        current.filter(
          (id) => id !== notificationId
        )
      );

      queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications
      .filter(
        (notification) =>
          !isNotificationRead(notification)
      )
      .map((notification) => notification.id);

    setReadNotificationIds((current) => [
      ...new Set([...current, ...unreadIds]),
    ]);

    queryClient.setQueryData<Notification[]>(
      ["notifications"],
      (current = []) =>
        current.map((notification) => ({
          ...notification,
          read: true,
        }))
    );

    try {
      await api.patch("/notifications/read-all");
    } catch (error) {
      console.error(
        "Failed to mark all notifications as read:",
        error
      );

      setReadNotificationIds((current) =>
        current.filter(
          (id) => !unreadIds.includes(id)
        )
      );

      queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });
    }
  };

  const formatNotificationTime = (
    createdAt: string
  ) => {
    const date = new Date(createdAt);
    const now = new Date();

    const difference =
      now.getTime() - date.getTime();

    const minutes = Math.floor(
      difference / (1000 * 60)
    );

    if (minutes < 1) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes}m ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours}h ago`;
    }

    const days = Math.floor(hours / 24);

    if (days < 7) {
      return `${days}d ago`;
    }

    return date.toLocaleDateString();
  };

  const NotificationDropdown = ({
    mobile = false,
  }: {
    mobile?: boolean;
  }) => (
    <div
      className={`absolute right-0 z-50 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl ${
        mobile
          ? "top-11 w-[calc(100vw-32px)] max-w-[360px]"
          : "top-12 w-[360px]"
      }`}
      onMouseDown={(event) =>
        event.stopPropagation()
      }
    >
      <div className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3.5">
        <div>
          <h3 className="text-sm font-bold text-[#1F2937]">
            Notifications
          </h3>

          {unreadCount > 0 && (
            <p className="mt-0.5 text-xs text-gray-500">
              {unreadCount} unread
            </p>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            className="rounded-md px-2 py-1 text-xs font-semibold text-[#0D5E72] transition hover:bg-[#E8F5F7]"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="max-h-[420px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#E8F5F7]">
              <Bell
                size={22}
                className="text-[#0D5E72]"
              />
            </div>

            <p className="mt-4 text-sm font-semibold text-gray-700">
              No notifications
            </p>

            <p className="mt-1 text-xs text-gray-400">
              You're all caught up.
            </p>
          </div>
        ) : (
          notifications.map((notification) => {
            const isRead =
              isNotificationRead(notification);

            return (
              <button
                key={notification.id}
                type="button"
                onClick={() =>
                  handleNotificationClick(
                    notification
                  )
                }
                className={`group flex w-full gap-3 border-b border-gray-100 px-4 py-4 text-left transition last:border-b-0 ${
                  isRead
                    ? "bg-white hover:bg-gray-50"
                    : "bg-[#F1FAFB] hover:bg-[#E8F5F7]"
                }`}
              >
                <div className="shrink-0 pt-0.5">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full ${
                      isRead
                        ? "bg-gray-100"
                        : "bg-[#D9F0F3]"
                    }`}
                  >
                    {isRead ? (
                      <Check
                        size={16}
                        className="text-gray-400"
                      />
                    ) : (
                      <Bell
                        size={16}
                        className="text-[#0D5E72]"
                      />
                    )}
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm leading-5 ${
                      isRead
                        ? "font-medium text-gray-600"
                        : "font-semibold text-[#1F2937]"
                    }`}
                  >
                    {notification.message}
                  </p>

                  <p className="mt-1.5 text-[11px] font-medium text-gray-400">
                    {formatNotificationTime(
                      notification.createdAt
                    )}
                  </p>
                </div>

                {!isRead && (
                  <div className="flex shrink-0 items-start pt-2">
                    <span className="h-2 w-2 rounded-full bg-[#0D5E72]" />
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2"
        >
          <img
            src="/vet-setu-logo.png"
            alt="Vet-Setu"
            className="h-11 w-auto object-contain"
          />

          <div className="hidden sm:block">
            <h1 className="text-lg font-bold leading-none text-[#0D5E72]">
              Vet-Setu
            </h1>

            <p className="mt-1 text-[10px] text-gray-500">
              Veterinary Care Made Easy
            </p>
          </div>
        </button>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const Icon = link.icon;

            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-[#E3F3F5] text-[#0D5E72]"
                      : "text-gray-600 hover:bg-gray-100 hover:text-[#0D5E72]"
                  }`
                }
              >
                <Icon size={17} />
                {link.name}
              </NavLink>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <div
            ref={desktopNotificationRef}
            className="relative"
          >
            <button
              type="button"
              onClick={() =>
                setNotificationOpen(
                  (open) => !open
                )
              }
              className="relative rounded-lg p-2.5 text-gray-600 transition hover:bg-[#E8F5F7] hover:text-[#0D5E72]"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell size={20} />

              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                  {unreadCount > 9
                    ? "9+"
                    : unreadCount}
                </span>
              )}
            </button>

            {notificationOpen && (
              <NotificationDropdown />
            )}
          </div>

          <button
            type="button"
            onClick={handleProfileClick}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-gray-100"
          >
            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#E8F5F7] text-[#0D5E72]">
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt={profileName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <UserRound size={18} />
                </div>
              )}
            </div>

            <div className="max-w-[120px] text-left">
              <p className="truncate text-sm font-semibold text-gray-800">
                {profileName}
              </p>

              <p className="text-xs text-gray-500">
                {isVet ? "Veterinarian" : "Farmer"}
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg p-2.5 text-gray-500 transition hover:bg-red-50 hover:text-red-600"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <div
            ref={mobileNotificationRef}
            className="relative"
          >
            <button
              type="button"
              onClick={() =>
                setNotificationOpen(
                  (open) => !open
                )
              }
              className="relative rounded-lg p-2 text-gray-600 hover:bg-[#E8F5F7] hover:text-[#0D5E72]"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell size={20} />

              {unreadCount > 0 && (
                <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white ring-2 ring-white">
                  {unreadCount > 9
                    ? "9+"
                    : unreadCount}
                </span>
              )}
            </button>

            {notificationOpen && (
              <NotificationDropdown mobile />
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              setMobileMenuOpen(
                (open) => !open
              )
            }
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <X size={24} />
            ) : (
              <Menu size={24} />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-gray-200 bg-white md:hidden">
          <nav className="mx-auto max-w-7xl space-y-1 px-4 py-3">
            {links.map((link) => {
              const Icon = link.icon;

              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() =>
                    setMobileMenuOpen(false)
                  }
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium ${
                      isActive
                        ? "bg-[#E3F3F5] text-[#0D5E72]"
                        : "text-gray-600 hover:bg-gray-100"
                    }`
                  }
                >
                  <Icon size={18} />
                  {link.name}
                </NavLink>
              );
            })}

            <div className="my-2 border-t border-gray-200" />

            <button
              type="button"
              onClick={handleProfileClick}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <div className="h-8 w-8 overflow-hidden rounded-full bg-[#E8F5F7] text-[#0D5E72]">
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt={profileName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <UserRound size={18} />
                  </div>
                )}
              </div>

              <div>
                <p>{profileName}</p>

                <p className="text-xs text-gray-500">
                  {isVet ? "Veterinarian" : "Farmer"}
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <LogOut size={18} />
              Logout
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}