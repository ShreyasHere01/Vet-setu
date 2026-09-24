import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Lock,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";

import api from "../lib/api";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [success, setSuccess] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: ResetPasswordFormData) => {
      const response = await api.post("/auth/reset-password", {
        token,
        newPassword: data.newPassword,
      });

      return response.data;
    },
    onSuccess: () => {
      setSuccess(true);
    },
  });

  const onSubmit = (data: ResetPasswordFormData) => {
    resetPasswordMutation.mutate(data);
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#F8FBF7] px-4 py-12">
        <div className="mx-auto max-w-md">
          <Card className="p-8 text-center">
            <h1 className="text-xl font-bold text-[#1F2937]">
              Invalid reset link
            </h1>

            <p className="mt-3 text-sm text-gray-600">
              This password reset link is invalid or incomplete.
            </p>

            <Link
              to="/forgot-password"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#0D5E72]"
            >
              <ArrowLeft className="h-4 w-4" />
              Request a new link
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#F8FBF7] px-4 py-12">
        <div className="mx-auto max-w-md">
          <Card className="p-8 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
              <CheckCircle className="h-7 w-7 text-[#2E7D32]" />
            </div>

            <h1 className="text-2xl font-bold text-[#1F2937]">
              Password reset successfully
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              Your password has been changed. You can now log in with your new
              password.
            </p>

            <Button
              type="button"
              className="mt-6 w-full"
              onClick={() => navigate("/login")}
            >
              Go to Login
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FBF7] px-4 py-12">
      <div className="mx-auto max-w-md">
        <Card className="p-8">
          <Link
            to="/login"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#0D5E72]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>

          <div className="mb-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8F5F7]">
              <Lock className="h-6 w-6 text-[#0D5E72]" />
            </div>

            <h1 className="text-2xl font-bold text-[#1F2937]">
              Reset your password
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Choose a new password for your Vet-Setu account.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label
                htmlFor="newPassword"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                New Password
              </label>

              <div className="relative">
                <input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Enter new password"
                  {...register("newPassword")}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-11 text-sm outline-none transition focus:border-[#0D5E72] focus:ring-2 focus:ring-[#0D5E72]/10"
                />

                <button
                  type="button"
                  onClick={() => setShowNewPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-[#0D5E72]"
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

              {errors.newPassword && (
                <p className="mt-1.5 text-sm text-red-600">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Confirm New Password
              </label>

              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Confirm new password"
                  {...register("confirmPassword")}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-11 text-sm outline-none transition focus:border-[#0D5E72] focus:ring-2 focus:ring-[#0D5E72]/10"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((value) => !value)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-[#0D5E72]"
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

              {errors.confirmPassword && (
                <p className="mt-1.5 text-sm text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {resetPasswordMutation.isError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {(
                  resetPasswordMutation.error as {
                    response?: {
                      data?: {
                        error?: string;
                      };
                    };
                  }
                )?.response?.data?.error ||
                  "Unable to reset your password. Please request a new reset link."}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              loading={resetPasswordMutation.isPending}
            >
              Reset Password
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}