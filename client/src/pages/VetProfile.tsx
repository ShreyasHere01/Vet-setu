import { useEffect, useRef, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Pencil,
  ShieldCheck,
  Stethoscope,
  UserRound,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import api from "../lib/api";
import Card from "../components/ui/Card";
import Avatar from "../components/ui/Avatar";
import Button from "../components/ui/Button";

const vetProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  specialty: z.string().min(2, "Specialty is required"),
  bio: z.string().optional(),
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

type VetProfileFormData = z.infer<typeof vetProfileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

interface VetProfile {
  id: number;
  specialty: string;
  bio: string | null;
  photoUrl: string | null;
  verified: boolean;
  user: {
    name: string;
    email: string;
  };
}

function VetProfileSkeleton() {
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

export default function VetProfile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VetProfileFormData>({
    resolver: zodResolver(vetProfileSchema),
    defaultValues: {
      name: "",
      specialty: "",
      bio: "",
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

  const {
    data: profile,
    isLoading,
    isError,
  } = useQuery<VetProfile | null>({
    queryKey: ["vet-profile"],
    queryFn: async () => {
      try {
        const response = await api.get("/vets/profile");
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 404) {
          return null;
        }

        throw error;
      }
    },
  });

  useEffect(() => {
    if (!profile) return;

    reset({
      name: profile.user.name,
      specialty: profile.specialty,
      bio: profile.bio || "",
    });
  }, [profile, reset]);

  const profileMutation = useMutation({
    mutationFn: async (data: VetProfileFormData) => {
      await api.patch("/users/profile", {
        name: data.name,
      });

      const response = await api.patch("/vets/profile", {
        specialty: data.specialty,
        bio: data.bio,
      });

      return response.data;
    },

    onSuccess: async (updatedVetProfile) => {
      const currentProfile =
        queryClient.getQueryData<VetProfile>(["vet-profile"]);

      if (currentProfile) {
        queryClient.setQueryData<VetProfile>(
          ["vet-profile"],
          {
            ...currentProfile,
            specialty: updatedVetProfile.specialty,
            bio: updatedVetProfile.bio,
            user: {
              ...currentProfile.user,
              name:
                updatedVetProfile.user?.name ||
                currentProfile.user.name,
            },
          }
        );
      }

      await queryClient.invalidateQueries({
        queryKey: ["vet-profile"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["farmer-profile"],
      });

      setIsEditing(false);
    },
  });

  const photoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();

      formData.append("photo", file);

      const response = await api.post(
        "/vets/profile/photo",
        formData
      );

      return response.data;
    },

    onSuccess: async () => {
      setPhotoError("");

      await queryClient.invalidateQueries({
        queryKey: ["vet-profile"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["vets"],
      });
    },

    onError: (error: any) => {
      setPhotoError(
        error.response?.data?.error ||
          "Failed to upload profile photo."
      );
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

      setPasswordSuccess(
        "Your password has been changed successfully."
      );

      setTimeout(() => {
        setIsChangingPassword(false);
        setPasswordSuccess("");
      }, 2500);
    },
  });

  const handleEdit = () => {
    if (!profile) return;

    reset({
      name: profile.user.name,
      specialty: profile.specialty,
      bio: profile.bio || "",
    });

    setIsEditing(true);
  };

  const handleCancel = () => {
    if (!profile) return;

    reset({
      name: profile.user.name,
      specialty: profile.specialty,
      bio: profile.bio || "",
    });

    setIsEditing(false);
  };

  const handlePhotoChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setPhotoError("");

    if (!file.type.startsWith("image/")) {
      setPhotoError("Please select an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Image must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    photoMutation.mutate(file);

    event.target.value = "";
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

  const onSubmit = (data: VetProfileFormData) => {
    profileMutation.mutate(data);
  };

  const onPasswordSubmit = (data: PasswordFormData) => {
    setPasswordSuccess("");
    passwordMutation.mutate(data);
  };

  if (isLoading) {
    return <VetProfileSkeleton />;
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-[#F8FBF7]">
        <main className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
          <Card className="p-8 text-center">
            <h2 className="text-lg font-bold text-[#1F2937]">
              Unable to load vet profile
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Please try again in a moment.
            </p>

            <Button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="mt-5"
            >
              Back to Dashboard
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#F8FBF7]">
        <main className="mx-auto max-w-2xl px-5 py-8 sm:px-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-[#0D5E72]"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </Link>

          <Card className="mt-7 p-6 sm:p-8">
            <div>
              <p className="text-sm font-semibold text-[#0D5E72]">
                Professional Account
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#1F2937]">
                Create Vet Profile
              </h1>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Add your professional information.
              </p>
            </div>

            {profileMutation.isError && (
              <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                Unable to create your vet profile. Please try again.
              </div>
            )}

            <form
              noValidate
              onSubmit={handleSubmit(onSubmit)}
              className="mt-7 space-y-5"
            >
              <div>
                <label className="text-sm font-semibold text-[#1F2937]">
                  Name
                </label>

                <input
                  {...register("name")}
                  placeholder="Enter your full name"
                  className="mt-2 h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-[#0D5E72] focus:ring-2 focus:ring-[#0D5E72]/10"
                />

                {errors.name && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-[#1F2937]">
                  Specialty
                </label>

                <input
                  {...register("specialty")}
                  placeholder="e.g. Large Animal Medicine"
                  className="mt-2 h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-[#0D5E72] focus:ring-2 focus:ring-[#0D5E72]/10"
                />

                {errors.specialty && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {errors.specialty.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-[#1F2937]">
                  Bio
                </label>

                <textarea
                  {...register("bio")}
                  rows={5}
                  placeholder="Tell farmers about your experience and veterinary services."
                  className="mt-2 w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-[#0D5E72] focus:ring-2 focus:ring-[#0D5E72]/10"
                />
              </div>

              <Button
                type="submit"
                loading={profileMutation.isPending}
                icon={<CheckCircle2 size={16} />}
                className="w-full"
              >
                Create Profile
              </Button>
            </form>
          </Card>
        </main>
      </div>
    );
  }

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
            Professional Account
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#1F2937]">
            My Vet Profile
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage your professional information and profile.
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
                      name={profile.user.name}
                      size="xl"
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
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
                      {profile.user.name}
                    </h2>
                  )}

                  <div className="mt-2 flex items-center justify-center gap-2 text-sm text-gray-600 sm:justify-start">
                    <Mail size={15} />
                    {profile.user.email}
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#B8DDE3] bg-white px-3 py-1.5 text-xs font-semibold text-[#0D5E72]">
                      <Stethoscope size={14} />
                      Veterinarian
                    </div>

                    {profile.verified && (
                      <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                        <CheckCircle2 size={14} />
                        Verified
                      </div>
                    )}
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
                    form="vet-profile-form"
                    loading={profileMutation.isPending}
                    icon={<CheckCircle2 size={16} />}
                  >
                    Save
                  </Button>
                </div>
              )}
            </div>

            {photoError && (
              <div className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {photoError}
              </div>
            )}

            {photoMutation.isPending && (
              <div className="mt-4 text-center text-xs font-medium text-[#0D5E72] sm:text-left">
                Uploading profile photo...
              </div>
            )}
          </div>

          <form
            id="vet-profile-form"
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
                Your basic professional account information.
              </p>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-[#1F2937]">
                    Full Name
                  </label>

                  <div className="mt-2 flex min-h-11 items-center gap-3 rounded-lg bg-gray-50 px-4 py-3 text-sm font-medium text-[#1F2937]">
                    <UserRound
                      size={16}
                      className="shrink-0 text-gray-400"
                    />

                    <span>
                      {isEditing
                        ? "Edited above"
                        : profile.user.name}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-[#1F2937]">
                    Email Address
                  </label>

                  <div className="mt-2 flex min-h-11 items-center gap-3 rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-600">
                    <Mail
                      size={16}
                      className="shrink-0 text-gray-400"
                    />

                    <span className="truncate">
                      {profile.user.email}
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
                <Stethoscope
                  size={19}
                  className="text-[#0D5E72]"
                />

                <h3 className="text-lg font-bold text-[#1F2937]">
                  Professional Information
                </h3>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                Information farmers see when viewing your veterinary
                profile.
              </p>

              {!isEditing ? (
                <div className="mt-5 overflow-hidden rounded-xl border border-gray-200">
                  <div className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Specialty
                    </p>

                    <p className="mt-1.5 text-sm font-semibold text-[#1F2937]">
                      {profile.specialty}
                    </p>
                  </div>

                  <div className="border-t border-gray-100 p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Professional Bio
                    </p>

                    <p className="mt-1.5 text-sm leading-6 text-gray-600">
                      {profile.bio ||
                        "No professional bio added yet."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-5 space-y-5">
                  <div>
                    <label className="text-sm font-semibold text-[#1F2937]">
                      Specialty
                    </label>

                    <input
                      {...register("specialty")}
                      className="mt-2 h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-[#0D5E72] focus:ring-2 focus:ring-[#0D5E72]/10"
                      placeholder="e.g. Large Animal Medicine"
                    />

                    {errors.specialty && (
                      <p className="mt-1.5 text-xs text-red-600">
                        {errors.specialty.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-[#1F2937]">
                      Professional Bio
                    </label>

                    <textarea
                      {...register("bio")}
                      rows={6}
                      className="mt-2 w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm leading-6 outline-none transition focus:border-[#0D5E72] focus:ring-2 focus:ring-[#0D5E72]/10"
                      placeholder="Tell farmers about your experience, expertise and veterinary services."
                    />
                  </div>
                </div>
              )}
            </section>

            {profileMutation.isError && (
              <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                Unable to update your vet profile. Please try again.
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
                    {(passwordMutation.error as any)?.response?.data
                      ?.error ||
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
              Verified veterinarian
            </p>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              Your verified status is displayed to farmers when they
              view your veterinary profile.
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
              alt={profile.user.name}
              className="max-h-[90vh] max-w-full rounded-xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}