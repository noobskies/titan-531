import React, { useState } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "../services/database/supabaseClient";
import { Modal } from "./Modal";
import { X } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [view, setView] = useState<"sign_in" | "sign_up">("sign_up");

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-slate-900 rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {view === "sign_up" ? "Create Account" : "Sign In"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-slate-300 text-sm">
            {view === "sign_up"
              ? "Enable cloud sync to access your workouts across devices."
              : "Welcome back! Sign in to sync your data."}
          </p>
        </div>

        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: "#3b82f6",
                  brandAccent: "#2563eb",
                  inputBackground: "#1e293b",
                  inputText: "white",
                  inputBorder: "#334155",
                  inputBorderFocus: "#3b82f6",
                  inputBorderHover: "#475569",
                },
              },
            },
          }}
          providers={["google"]}
          view={view}
          theme="dark"
          redirectTo={`${window.location.origin}/`}
          onlyThirdPartyProviders={false}
          magicLink={false}
        />

        <div className="mt-4 text-center">
          <button
            onClick={() => setView(view === "sign_in" ? "sign_up" : "sign_in")}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            {view === "sign_in"
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </Modal>
  );
};
