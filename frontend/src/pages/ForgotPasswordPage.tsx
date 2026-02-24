import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { http } from "../api/http";
import { forgotPasswordSchema } from "../validation/authSchemas";
import { Input } from "../components/forms/Input";
import { Label } from "../components/forms/Label";

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (payload: { email: string }) => {
      await http.post("/auth/forgot-password", payload);
    },
    onSuccess: () => {
      toast.success(
        "If an account exists for this email, you will receive a reset link shortly."
      );
      setEmail("");
      setValidationError(null);
    },
    // Error handling is done globally in queryClient
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Invalid input.";
      setValidationError(firstError);
      toast.error(firstError);
      return;
    }

    mutation.mutate(parsed.data);
  };

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-5 sm:p-8 shadow-xl">
      <h1 className="mb-4 text-lg sm:text-2xl font-black text-slate-900 tracking-tight uppercase">Forgot password</h1>
      {validationError && (
        <p className="mb-3 text-xs text-destructive">{validationError}</p>
      )}
      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 sm:py-2.5 text-sm font-bold text-white tracking-widest hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 shadow-lg shadow-primary/20 transition-all active:scale-[0.98] uppercase"
        >
          {mutation.isPending ? "Sending..." : "Send reset link"}
        </button>
      </form>
    </div>
  );
};

export default ForgotPasswordPage;


