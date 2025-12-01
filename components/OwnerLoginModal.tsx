"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface OwnerLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default function OwnerLoginModal({ isOpen, onClose }: OwnerLoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const role = await login(email, password, "owner");
      onClose();
      if (role === "owner") {
        router.push("/dashboard/owner");
      } else {
        setError("Invalid account type. Only owner accounts can login here.");
      }
    } catch (err: unknown) {
      const message = err && typeof err === "object" && "message" in err ? (err as { message?: string }).message : undefined;
      setError(message ?? "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(255, 255, 255, 0.5)" }}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Owner Sign In</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition" aria-label="Close modal">
            <CloseIcon />
          </button>
        </div>

        <div className="p-6">
          {error && <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d47a1] text-sm"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d47a1] text-sm"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 rounded-lg text-sm font-medium text-white bg-[#0d47a1] hover:bg-[#083055] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0d47a1] disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>

            <p className="text-center text-sm text-gray-600">
              Dont have an account?{" "}
              <button type="button" onClick={onClose} className="font-medium text-[#0d47a1] hover:text-[#083055]">
                Contact Admin
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
