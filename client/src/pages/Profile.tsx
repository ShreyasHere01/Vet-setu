import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Crosshair,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  MapPin,
  Pencil,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

import api from "../lib/api";
import Card from "../components/ui/Card";
import Avatar from "../components/ui/Avatar";
import Button from "../components/ui/Button";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  farmAddress: z
    .string()
    .min(5, "Farm address must be at least 5 characters"),
  farmLatitude: z
    .number()
    .min(-90, "Invalid latitude")
    .max(90, "Invalid latitude"),
  farmLongitude: z
    .number()
    .min(-180, "Invalid longitude")
    .max(180, "Invalid longitude"),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

interface FarmerProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  photoUrl: string | null;
  createdAt: string;
  farmAddress: string | null;
  farmLatitude: number | null;
  farmLongitude: number | null;
}

export default function Profile() {
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [locationMessage, setLocationMessage] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    data: profile,
    isLoading,
    isError,
  } = useQuery<FarmerProfile>({
    queryKey: ["farmer-profile"],
    queryFn: async () => {
      const response = await api.get("/users/profile");
      return response.data;
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      farmAddress: "",
      farmLatitude: 0,
      farmLongitude: 0,
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const latitude = watch("farmLatitude");
  const longitude = watch("farmLongitude");

  useEffect(() => {
    if (!profile) return;

    reset({
      name: profile.name,
      farmAddress: profile.farmAddress || "",
      farmLatitude: profile.farmLatitude ?? 0,
      farmLongitude: profile.farmLongitude ?? 0,
    });
  }, [profile, reset]);

  const profileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      await api.patch("/users/profile", {
        name: data.name,
      });

      await api.patch("/users/profile/farm-location", {
        farmAddress: data.farmAddress,
        farmLatitude: data.farmLatitude,
        farmLongitude: data.farmLongitude,
      });

      return data;
    },

    onSuccess: async (data) => {
      const currentProfile =
        queryClient.getQueryData<FarmerProfile>(["farmer-profile"]);

      if (currentProfile) {
        queryClient.setQueryData<FarmerProfile>(["farmer-profile"], {
          ...currentProfile,
          name: data.name,
          farmAddress: data.farmAddress,
          farmLatitude: data.farmLatitude,
          farmLongitude: data.farmLongitude,
        });
      }

      setIsEditing(false);
      setLocationStatus("idle");
      setLocationMessage("");

      await queryClient.invalidateQueries({
        queryKey: ["farmer-profile"],
      });
    },
  });

  const photoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();

      formData.append("photo", file);

      await api.post("/users/profile/photo", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["farmer-profile"],
      });
    },
  });

  const passwordMutation = useMutation({
    mutationFn: async (data: PasswordFormData) => {
      const response = await api.post("/auth/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      return response.data;
    },

    onSuccess: () => {
      resetPassword();
      setPasswordSuccess("Your password has been changed successfully.");

      setTimeout(() => {
        setIsChangingPassword(false);
        setPasswordSuccess("");
      }, 2500);
    },
  });

  const handlePhotoChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    photoMutation.mutate(file);

    event.target.value = "";
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      setLocationMessage(
        "Location services are not supported by your browser."
      );
      return;
    }

    setLocationStatus("loading");
    setLocationMessage("Getting your current location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setValue("farmLatitude", lat, {
          shouldValidate: true,
          shouldDirty: true,
        });

        setValue("farmLongitude", lng, {
          shouldValidate: true,
          shouldDirty: true,
        });

        setLocationStatus("success");
        setLocationMessage(
          "Location detected successfully. Check the map before saving."
        );
      },
      () => {
        setLocationStatus("error");
        setLocationMessage(
          "Unable to get your location. Please allow location access and try again."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const handleEdit = () => {
    if (!profile) return;

    reset({
      name: profile.name,
      farmAddress: profile.farmAddress || "",
      farmLatitude: profile.farmLatitude ?? 0,
      farmLongitude: profile.farmLongitude ?? 0,
    });

    setLocationStatus("idle");
    setLocationMessage("");
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (!profile) return;

    reset({
      name: profile.name,
      farmAddress: profile.farmAddress || "",
      farmLatitude: profile.farmLatitude ?? 0,
      farmLongitude: profile.farmLongitude ?? 0,
    });

    setLocationStatus("idle");
    setLocationMessage("");
    setIsEditing(false);
  };

  const handleOpenPasswordChange = () => {
    setPasswordSuccess("");
    passwordMutation.reset();
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setIsChangingPassword(true);
  };

  const handleCancelPasswordChange = () => {
    resetPassword();
    passwordMutation.reset();
    setPasswordSuccess("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setIsChangingPassword(false);
  };

  const onSubmit = (data: ProfileFormData) => {
    profileMutation.mutate(data);
  };

  const onPasswordSubmit = (data: PasswordFormData) => {
    setPasswordSuccess("");
    passwordMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FBF7]">
        <main className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
          <div className="animate-pulse">
            <div className="h-5 w-32 rounded bg-gray-200" />
            <div className="mt-8 h-48 rounded-2xl bg-gray-200" />
            <div className="mt-5 h-96 rounded-2xl bg-gray-200" />
          </div>
        </main>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="min-h-screen bg-[#F8FBF7]">
        <main className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
          <Card className="p-8 text-center">
            <h2 className="text-lg font-bold text-[#1F2937]">
              Unable to load profile
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Please try again in a moment.
            </p>
          </Card>
        </main>
      </div>
    );
  }

  const hasLocation =
    !!profile.farmAddress &&
    profile.farmLatitude !== null &&
    profile.farmLongitude !== null;

  const mapUrl = hasLocation
    ? `https://www.google.com/maps/search/?api=1&query=${profile.farmLatitude},${profile.farmLongitude}`
    : "";

  const currentMapUrl =
    latitude !== 0 &&
    longitude !== 0 &&
    !Number.isNaN(latitude) &&
    !Number.isNaN(longitude)
      ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
      : "";

  return (
    <div className="min-h-screen bg-[#F8FBF7]">
      <main className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-[#0D5E72]"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </Link>

        <div className="mt-7">
          <p className="text-sm font-semibold text-[#0D5E72]">
            Account
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#1F2937]">
            My Profile
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage your account details and farm location.
          </p>
        </div>

        <Card className="mt-8 overflow-hidden">
          <div className="bg-[#E8F5F7] px-6 py-7 sm:px-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col items-center gap-5 sm:flex-row">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      if (profile.photoUrl) {
                        setSelectedPhoto(profile.photoUrl);
                      }
                    }}
                    className="rounded-full"
                  >
                    <Avatar
                      src={profile.photoUrl}
                      name={profile.name}
                      size="xl"
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={photoMutation.isPending}
                    className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#0D5E72] text-white shadow-sm transition hover:bg-[#094A5A] disabled:cursor-not-allowed disabled:opacity-60"
                    title="Change profile photo"
                  >
                    <Camera size={16} />
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </div>

                <div className="text-center sm:text-left">
                  {isEditing ? (
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Full Name
                      </label>

                      <input
                        {...register("name")}
                        className="mt-1.5 h-11 w-full min-w-[250px] rounded-lg border border-gray-300 bg-white px-3 text-sm font-semibold text-[#1F2937] outline-none transition focus:border-[#0D5E72] focus:ring-2 focus:ring-[#0D5E72]/10"
                        placeholder="Enter your name"
                      />

                      {errors.name && (
                        <p className="mt-1.5 text-left text-xs text-red-600">
                          {errors.name.message}
                        </p>
                      )}
                    </div>
                  ) : (
                    <h2 className="text-2xl font-bold text-[#1F2937]">
                      {profile.name}
                    </h2>
                  )}

                  <div className="mt-2 flex items-center justify-center gap-2 text-sm text-gray-600 sm:justify-start">
                    <Mail size={15} />
                    {profile.email}
                  </div>

                  <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#B8DDE3] bg-white px-3 py-1.5 text-xs font-semibold text-[#0D5E72]">
                    <UserRound size={14} />
                    Farmer Account
                  </div>
                </div>
              </div>

              {!isEditing ? (
                <Button
                  type="button"
                  variant="secondary"
                  icon={<Pencil size={16} />}
                  onClick={handleEdit}
                  className="self-center sm:self-start"
                >
                  Edit Profile
                </Button>
              ) : (
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                  <Button
                    type="button"
                    variant="secondary"
                    icon={<X size={16} />}
                    onClick={handleCancel}
                    disabled={profileMutation.isPending}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    form="profile-form"
                    loading={profileMutation.isPending}
                    icon={<CheckCircle2 size={16} />}
                  >
                    Save
                  </Button>
                </div>
              )}
            </div>
          </div>

          <form
            id="profile-form"
            onSubmit={handleSubmit(onSubmit)}
            className="p-6 sm:p-8"
          >
            <section>
              <div className="flex items-center gap-2">
                <UserRound
                  size={18}
                  className="text-[#0D5E72]"
                />

                <h3 className="text-lg font-bold text-[#1F2937]">
                  Personal Information
                </h3>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                Your basic account information.
              </p>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-[#1F2937]">
                    Full Name
                  </label>

                  <div className="mt-2 rounded-lg bg-gray-50 px-4 py-3 text-sm font-medium text-[#1F2937]">
                    {isEditing ? (
                      <span className="text-gray-400">
                        Edited above
                      </span>
                    ) : (
                      profile.name
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-[#1F2937]">
                    Email Address
                  </label>

                  <div className="mt-2 flex min-h-11 items-center gap-3 rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-600">
                    <Mail size={16} className="text-gray-400" />

                    <span className="truncate">
                      {profile.email}
                    </span>
                  </div>

                  <p className="mt-1.5 text-xs text-gray-400">
                    Email address cannot be changed.
                  </p>
                </div>
              </div>
            </section>

            <div className="my-8 border-t border-gray-100" />

            <section>
              <div className="flex items-center gap-2">
                <MapPin
                  size={19}
                  className="text-[#0D5E72]"
                />

                <h3 className="text-lg font-bold text-[#1F2937]">
                  Farm Location
                </h3>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                Your veterinarian can use this location when visiting
                your farm for a confirmed appointment.
              </p>

              {!isEditing ? (
                <div className="mt-5">
                  {hasLocation ? (
                    <div className="rounded-xl border border-gray-200 bg-[#F8FBF7] p-5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E8F5F7] text-[#0D5E72]">
                          <MapPin size={19} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-[#1F2937]">
                            Farm address
                          </p>

                          <p className="mt-1 text-sm leading-6 text-gray-600">
                            {profile.farmAddress}
                          </p>

                          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                            <CheckCircle2 size={13} />
                            GPS location saved
                          </div>
                        </div>
                      </div>

                      <a
                        href={mapUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#0D5E72] bg-white px-4 py-2 text-sm font-semibold text-[#0D5E72] transition hover:bg-[#E8F5F7]"
                      >
                        <MapPin size={16} />
                        View on Google Maps
                      </a>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-gray-400">
                          <MapPin size={19} />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-[#1F2937]">
                            Farm location not added
                          </p>

                          <p className="mt-1 text-sm leading-6 text-gray-500">
                            Click Edit Profile above to add your farm
                            address and GPS location.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-5 space-y-5">
                  <div>
                    <label className="text-sm font-semibold text-[#1F2937]">
                      Farm Address
                    </label>

                    <textarea
                      {...register("farmAddress")}
                      rows={3}
                      className="mt-2 w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-[#0D5E72] focus:ring-2 focus:ring-[#0D5E72]/10"
                      placeholder="Enter your farm or gotha address"
                    />

                    {errors.farmAddress && (
                      <p className="mt-1.5 text-xs text-red-600">
                        {errors.farmAddress.message}
                      </p>
                    )}
                  </div>

                  <div className="rounded-xl border-2 border-[#B8DDE3] bg-[#F4FBFC] p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#0D5E72]">
                          <Crosshair size={18} />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-[#1F2937]">
                            Farm GPS Location
                          </p>

                          <p className="mt-1 max-w-md text-xs leading-5 text-gray-500">
                            Your farm location is editable while your
                            profile is in edit mode. Stand at your farm
                            and use your current location to update it.
                          </p>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="secondary"
                        icon={<Crosshair size={16} />}
                        loading={locationStatus === "loading"}
                        onClick={handleGetLocation}
                      >
                        Get Current Location
                      </Button>
                    </div>

                    {locationStatus === "success" && (
                      <div className="mt-4 flex items-start gap-2 rounded-lg bg-green-50 px-3 py-2.5 text-xs leading-5 text-green-700">
                        <CheckCircle2
                          size={16}
                          className="mt-0.5 shrink-0"
                        />

                        <span>{locationMessage}</span>
                      </div>
                    )}

                    {locationStatus === "error" && (
                      <div className="mt-4 rounded-lg bg-red-50 px-3 py-2.5 text-xs leading-5 text-red-700">
                        {locationMessage}
                      </div>
                    )}

                    {currentMapUrl && (
                      <a
                        href={currentMapUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#0D5E72] hover:underline"
                      >
                        <MapPin size={16} />
                        Check detected location on Google Maps
                      </a>
                    )}
                  </div>

                  <details className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                    <summary className="cursor-pointer text-xs font-semibold text-gray-500">
                      Location details
                    </summary>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold text-gray-500">
                          Latitude
                        </label>

                        <input
                          type="number"
                          step="any"
                          {...register("farmLatitude", {
                            valueAsNumber: true,
                          })}
                          className="mt-2 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[#0D5E72]"
                        />

                        {errors.farmLatitude && (
                          <p className="mt-1.5 text-xs text-red-600">
                            {errors.farmLatitude.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-500">
                          Longitude
                        </label>

                        <input
                          type="number"
                          step="any"
                          {...register("farmLongitude", {
                            valueAsNumber: true,
                          })}
                          className="mt-2 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[#0D5E72]"
                        />

                        {errors.farmLongitude && (
                          <p className="mt-1.5 text-xs text-red-600">
                            {errors.farmLongitude.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </details>
                </div>
              )}
            </section>

            {profileMutation.isError && (
              <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                Unable to update your profile. Please try again.
              </div>
            )}
          </form>
        </Card>

        <Card className="mt-5 overflow-hidden">
          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E8F5F7] text-[#0D5E72]">
                <LockKeyhole size={20} />
              </div>

              <div>
                <h3 className="text-base font-bold text-[#1F2937]">
                  Password & Security
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Keep your account secure with a strong password.
                </p>
              </div>
            </div>

            {!isChangingPassword && (
              <Button
                type="button"
                variant="secondary"
                onClick={handleOpenPasswordChange}
                icon={<LockKeyhole size={16} />}
                className="w-full sm:w-auto"
              >
                Change Password
              </Button>
            )}
          </div>

          {isChangingPassword && (
            <div className="border-t border-gray-100 bg-[#FAFCFC] px-5 py-6 sm:px-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-[#1F2937]">
                    Change your password
                  </h4>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Enter your current password and choose a new one.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCancelPasswordChange}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                  aria-label="Close password form"
                >
                  <X size={17} />
                </button>
              </div>

              <form
                onSubmit={handlePasswordSubmit(onPasswordSubmit)}
                className="max-w-xl space-y-4"
              >
                <div>
                  <label className="text-sm font-semibold text-[#1F2937]">
                    Current Password
                  </label>

                  <div className="relative mt-2">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      {...registerPassword("currentPassword")}
                      autoComplete="current-password"
                      className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 pr-11 text-sm outline-none transition focus:border-[#0D5E72] focus:ring-2 focus:ring-[#0D5E72]/10"
                      placeholder="Enter current password"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword((value) => !value)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#0D5E72]"
                      aria-label={
                        showCurrentPassword
                          ? "Hide current password"
                          : "Show current password"
                      }
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  {passwordErrors.currentPassword && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {passwordErrors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-semibold text-[#1F2937]">
                    New Password
                  </label>

                  <div className="relative mt-2">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      {...registerPassword("newPassword")}
                      autoComplete="new-password"
                      className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 pr-11 text-sm outline-none transition focus:border-[#0D5E72] focus:ring-2 focus:ring-[#0D5E72]/10"
                      placeholder="Enter new password"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowNewPassword((value) => !value)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#0D5E72]"
                      aria-label={
                        showNewPassword
                          ? "Hide new password"
                          : "Show new password"
                      }
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  {passwordErrors.newPassword && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {passwordErrors.newPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-semibold text-[#1F2937]">
                    Confirm New Password
                  </label>

                  <div className="relative mt-2">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      {...registerPassword("confirmPassword")}
                      autoComplete="new-password"
                      className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 pr-11 text-sm outline-none transition focus:border-[#0D5E72] focus:ring-2 focus:ring-[#0D5E72]/10"
                      placeholder="Re-enter new password"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((value) => !value)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#0D5E72]"
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  {passwordErrors.confirmPassword && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {passwordErrors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {passwordMutation.isError && (
                  <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                    {(passwordMutation.error as any)?.response?.data?.error ||
                      "Unable to change your password. Please try again."}
                  </div>
                )}

                {passwordSuccess && (
                  <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                    <CheckCircle2 size={17} />
                    {passwordSuccess}
                  </div>
                )}

                <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCancelPasswordChange}
                    disabled={passwordMutation.isPending}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    loading={passwordMutation.isPending}
                    icon={<LockKeyhole size={16} />}
                  >
                    Update Password
                  </Button>
                </div>
              </form>
            </div>
          )}
        </Card>

        <div className="mt-5 flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4">
          <ShieldCheck
            size={18}
            className="mt-0.5 shrink-0 text-[#2E7D32]"
          />

          <div>
            <p className="text-sm font-semibold text-[#1F2937]">
              Your location privacy
            </p>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              Your farm location is stored securely and is intended to
              help veterinarians reach you for relevant appointments.
            </p>
          </div>
        </div>
      </main>

      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-3xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black"
              aria-label="Close photo"
            >
              <X size={18} />
            </button>

            <img
              src={selectedPhoto}
              alt={profile.name}
              className="max-h-[90vh] max-w-full rounded-xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}