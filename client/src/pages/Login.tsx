import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import api from "../lib/api";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { loginSchema } from "../schemas/auth.schema";
import type { LoginFormData } from "../schemas/auth.schema";


export default function Login() {
  const login = useAuthStore((state) => state.login);
  const naviagte =useNavigate();
  const [serverError,setServerError]=useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError("");
    try {
      const response = await api.post("/auth/login", data);

      

      login(response.data.user, response.data.token);
      naviagte("/dashboard")
    } catch (error:any) {
       setServerError(
      error.response?.data?.error || "Login failed"
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
        <h1 className="text-2xl font-bold">Login</h1>
        {serverError && (
  <p className="text-red-500">
    {serverError}
  </p>
)}

        <div>
          <label>Email</label>

          <input
            type="email"
            {...register("email")}
            className="w-full rounded border p-2"
          />

          {errors.email && (
            <p className="text-red-500">{errors.email.message}</p>
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
            <p className="text-red-500">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full rounded bg-blue-600 p-2 text-white"
        >
          Login
        </button>
      </form>
    </div>
  );
}