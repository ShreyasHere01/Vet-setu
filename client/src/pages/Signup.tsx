import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

import { signupSchema } from "../schemas/auth.schema";
import type { SignupFormData } from "../schemas/auth.schema";
import api from "../lib/api";
import { useAuthStore } from "../store/authStore";
import Button from "../components/ui/Button";

export default function Signup() {
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setServerError("");
    setLoading(true);

    try {
      await api.post("/auth/signup", data);

      const response = await api.post("/auth/login", {
        email: data.email,
        password: data.password,
      });

      login(response.data.user, response.data.token);

      if (data.role === "VET") {
        navigate("/vet/profile");
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      setServerError(
        error.response?.data?.error || "Unable to create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FBF7] px-4 py-8 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl lg:grid-cols-[0.9fr_1.1fr]">
          <div className="hidden bg-[#0D5E72] p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="mb-8 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white">
                  <img
                    src="/vet-setu-logo.png"
                    alt="Vet-Setu"
                    className="h-full w-full object-contain"
                  />
                </div>

                <div>
                  <p className="text-xl font-bold">Vet-Setu</p>
                  <p className="text-sm text-white/75">
                    Veterinary Care Made Easy
                  </p>
                </div>
              </div>

              <h1 className="max-w-md text-4xl font-bold leading-tight">
                Start managing veterinary care smarter.
              </h1>

              <p className="mt-5 max-w-md text-base leading-7 text-white/80">
                Create your Vet-Setu account and connect with a platform built
                for farmers and veterinarians.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <ShieldCheck size={21} />
                </div>

                <div>
                  <p className="text-sm font-semibold">Secure account</p>
                  <p className="mt-0.5 text-xs text-white/70">
                    Your account information stays protected.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <UserRound size={21} />
                </div>

                <div>
                  <p className="text-sm font-semibold">Choose your role</p>
                  <p className="mt-0.5 text-xs text-white/70">
                    Join Vet-Setu as a farmer or veterinarian.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center p-6 sm:p-10 lg:p-12">
            <form
              noValidate
              onSubmit={handleSubmit(onSubmit)}
              className="w-full max-w-md"
            >
              <div className="mb-8 lg:hidden">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <img
                      src="/vet-setu-logo.png"
                      alt="Vet-Setu"
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <div>
                    <p className="text-lg font-bold text-[#0D5E72]">
                      Vet-Setu
                    </p>
                    <p className="text-xs text-gray-500">
                      Veterinary Care Made Easy
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-7">
                <p className="mb-2 text-sm font-semibold text-[#0D5E72]">
                  Get started
                </p>

                <h2 className="text-3xl font-bold tracking-tight text-[#1F2937]">
                  Create your account
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Join Vet-Setu and simplify veterinary care management.
                </p>
              </div>

              {serverError && (
                <div
                  role="alert"
                  className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                >
                  {serverError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-[#1F2937]"
                  >
                    Full name
                  </label>

                  <div className="relative">
                    <UserRound
                      size={18}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      id="name"
                      type="text"
                      autoComplete="name"
                      placeholder="Enter your full name"
                      {...register("name")}
                      className={`h-12 w-full rounded-xl border bg-white pl-11 pr-4 text-sm text-[#1F2937] outline-none transition placeholder:text-gray-400 ${
                        errors.name
                          ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                          : "border-gray-300 focus:border-[#0D5E72] focus:ring-4 focus:ring-[#0D5E72]/10"
                      }`}
                    />
                  </div>

                  {errors.name && (
                    <p className="mt-1.5 text-sm text-red-600">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-[#1F2937]"
                  >
                    Email address
                  </label>

                  <div className="relative">
                    <Mail
                      size={18}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="Enter your email"
                      {...register("email")}
                      className={`h-12 w-full rounded-xl border bg-white pl-11 pr-4 text-sm text-[#1F2937] outline-none transition placeholder:text-gray-400 ${
                        errors.email
                          ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                          : "border-gray-300 focus:border-[#0D5E72] focus:ring-4 focus:ring-[#0D5E72]/10"
                      }`}
                    />
                  </div>

                  {errors.email && (
                    <p className="mt-1.5 text-sm text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-[#1F2937]"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={18}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Create a password"
                      {...register("password")}
                      className={`h-12 w-full rounded-xl border bg-white pl-11 pr-12 text-sm text-[#1F2937] outline-none transition placeholder:text-gray-400 ${
                        errors.password
                          ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                          : "border-gray-300 focus:border-[#0D5E72] focus:ring-4 focus:ring-[#0D5E72]/10"
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-[#0D5E72]"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </button>
                  </div>

                  {errors.password && (
                    <p className="mt-1.5 text-sm text-red-600">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="role"
                    className="mb-2 block text-sm font-semibold text-[#1F2937]"
                  >
                    I am a
                  </label>

                  <select
                    id="role"
                    {...register("role")}
                    defaultValue=""
                    className={`h-12 w-full rounded-xl border bg-white px-4 text-sm text-[#1F2937] outline-none transition ${
                      errors.role
                        ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                        : "border-gray-300 focus:border-[#0D5E72] focus:ring-4 focus:ring-[#0D5E72]/10"
                    }`}
                  >
                    <option value="" disabled>
                      Select your role
                    </option>
                    <option value="FARMER">Farmer</option>
                    <option value="VET">Veterinarian</option>
                  </select>

                  {errors.role && (
                    <p className="mt-1.5 text-sm text-red-600">
                      {errors.role.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  loading={loading}
                  className="mt-2 h-12 w-full rounded-xl"
                >
                  Create Account
                </Button>
              </div>

              <div className="my-7 flex items-center gap-4">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-xs font-medium text-gray-400">OR</span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="font-semibold text-[#0D5E72] hover:text-[#094A5A]"
                >
                  Login
                </button>
              </p>

              <p className="mt-6 text-center text-xs leading-5 text-gray-400">
                By creating an account, you agree to use Vet-Setu responsibly
                for veterinary care management.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}