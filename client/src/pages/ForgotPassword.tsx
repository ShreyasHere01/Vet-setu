import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";

import api from "../lib/api";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: ForgotPasswordFormData) => {
      const response = await api.post("/auth/forgot-password", data);
      return response.data;
    },
    onSuccess: () => {
      setSuccess(true);
    },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    forgotPasswordMutation.mutate(data);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F8FBF7] px-4 py-12">
        <div className="mx-auto flex max-w-md justify-center">
          <Card className="w-full p-8 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
              <CheckCircle className="h-7 w-7 text-[#2E7D32]" />
            </div>

            <h1 className="text-2xl font-bold text-[#1F2937]">
              Check your email
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              If an account exists with that email, we've sent you a password
              reset link.
            </p>

            <p className="mt-3 text-sm text-gray-500">
              The link will expire in 15 minutes.
            </p>

            <Link
              to="/login"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#0D5E72] hover:text-[#094A5A]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FBF7] px-4 py-12">
      <div className="mx-auto flex max-w-md justify-center">
        <Card className="w-full p-8">
          <Link
            to="/login"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#0D5E72]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>

          <div className="mb-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8F5F7]">
              <Mail className="h-6 w-6 text-[#0D5E72]" />
            </div>

            <h1 className="text-2xl font-bold text-[#1F2937]">
              Forgot your password?
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Enter your email address and we'll send you a link to reset your
              password.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Email Address
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...register("email")}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0D5E72] focus:ring-2 focus:ring-[#0D5E72]/10"
              />

              {errors.email && (
                <p className="mt-1.5 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            {forgotPasswordMutation.isError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                Something went wrong. Please try again.
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              loading={forgotPasswordMutation.isPending}
            >
              Send Reset Link
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}