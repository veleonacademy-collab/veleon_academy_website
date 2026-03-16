import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../state/AuthContext";
import { http } from "../api/http";
import type { AuthTokens, User } from "../types/auth";
import { loginSchema } from "../validation/authSchemas";
import type { GoogleOAuthRequest } from "../types/oauth";
import { Input } from "../components/forms/Input";
import { Label } from "../components/forms/Label";
import SEO from "../components/SEO";

interface LocationState {
  from?: { 
    pathname?: string;
    search?: string;
    hash?: string;
  };
}

const LoginPage: React.FC = () => {
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | undefined;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: async (values: { email: string; password: string }) => {
      const res = await http.post<{ user: User; tokens: AuthTokens }>(
        "/auth/login",
        values
      );
      return res.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.tokens);
      toast.success(`Welcome back, ${data.user.firstName}!`);
      const from = state?.from;
      const isAuthPage = from?.pathname === "/login" || from?.pathname === "/register" || from?.pathname?.includes("/verify-email") || from?.pathname?.includes("/reset-password");
      const redirectTo = from && !isAuthPage
        ? `${from.pathname ?? ""}${from.search ?? ""}${from.hash ?? ""}` 
        : "/courses";
      navigate(redirectTo || "/courses", { replace: true });
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message || err.message);
    },
  });

  const oauthMutation = useMutation({
    mutationFn: async (payload: GoogleOAuthRequest) => {
      const res = await http.post<{ user: User; tokens: AuthTokens }>(
        "/auth/oauth/google",
        payload
      );
      return res.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.tokens);
      toast.success(`Welcome, ${data.user.firstName}!`);
      const from = state?.from;
      const isAuthPage = from?.pathname === "/login" || from?.pathname === "/register" || from?.pathname?.includes("/verify-email") || from?.pathname?.includes("/reset-password");
      const redirectTo = from && !isAuthPage
        ? `${from.pathname ?? ""}${from.search ?? ""}${from.hash ?? ""}` 
        : "/courses";
      navigate(redirectTo || "/courses", { replace: true });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Invalid input.";
      setError(firstError);
      return;
    }

    loginMutation.mutate(parsed.data);
  };

  const handleGoogleSuccess = (credentialResponse: any) => {
    if (credentialResponse.credential) {
      oauthMutation.mutate({ idToken: credentialResponse.credential });
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-xl">
      <SEO 
          title="Login"
          description="Login to your Veleon Academy account to access your courses, dashboard, and learning resources."
      />
      <div className="flex justify-center mb-4">
        <Link to="/">
          <img src="/veleonacademy_logo.png" alt="VeleonAcademy" className="h-16 w-auto" />
        </Link>
      </div>
      <h1 className="mb-3 text-center text-lg sm:text-2xl font-black text-slate-900 tracking-tight uppercase">Login</h1>
      {error && (
        <div className="mb-3">
          <p className="text-xs text-destructive text-center">{error}</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-3">
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        <div className="flex items-center justify-between text-xs">
          <Link to="/forgot-password" state={location.state} className="text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 sm:py-2.5 text-sm font-bold text-white tracking-widest hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 shadow-lg shadow-primary/20 transition-all active:scale-[0.98] uppercase"
        >
          {loginMutation.isPending ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <div className="mt-3 border-t border-border pt-3 flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => {
            console.error("Google Login Failed");
            toast.error("Google Login Failed");
          }}
          theme="filled_black"
          shape="rectangular"
          width="100%"
        />
      </div>
      <p className="mt-3 text-[10px] sm:text-xs text-muted-foreground text-center">
        Don&apos;t have an account?{" "}
        <Link to="/register" state={location.state} className="text-primary font-bold hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
