import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signupSchema } from "../schemas/auth.schema";
import type { SignupFormData } from "../schemas/auth.schema";

import api from "../lib/api";
import { useAuthStore } from "../store/authStore";



export default function Signup() {
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setServerError("");

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
        error.response?.data?.error || "Signup failed"
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md space-y-4 rounded-lg border p-6"
      >
        <h1 className="text-2xl font-bold">Create Account</h1>

        {serverError && (
          <p className="text-sm text-red-500">
            {serverError}
          </p>
        )}

        <div>
          <label>Name</label>

          <input
            {...register("name")}
            className="w-full rounded border p-2"
          />

          {errors.name && (
            <p className="text-red-500">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label>Email</label>

          <input
            type="email"
            {...register("email")}
            className="w-full rounded border p-2"
          />

          {errors.email && (
            <p className="text-red-500">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label>Password</label>

          <input
            type="password"
            {...register("password")}
            className="w-full rounded border p-2"
          />

          {errors.password && (
            <p className="text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label>Role</label>

          <select
            {...register("role")}
            className="w-full rounded border p-2"
            defaultValue=""
          >
            <option value="" disabled>
              Select role
            </option>

            <option value="FARMER">Farmer</option>
            <option value="VET">Veterinarian</option>
          </select>

          {errors.role && (
            <p className="text-red-500">
              {errors.role.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full rounded bg-blue-600 p-2 text-white"
        >
          Sign Up
        </button>

        <p className="text-center text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}