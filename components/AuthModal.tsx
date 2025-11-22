import React, { useState, useEffect } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "../services/database/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { Modal } from "./Modal";
import { X, Loader2, CheckCircle, AlertCircle } from "lucide-react";

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
  const { isAuthenticated, migrating, migrationError } = useAuth();
  const [showSuccess, setShowSuccess] = useState(false);

  // Handle successful auth + migration
  useEffect(() => {
    if (isAuthenticated && !migrating && !migrationError) {
      setShowSuccess(true);

      // Auto-close after showing success message
      const timer = setTimeout(() => {
        onSuccess?.();
        onClose();
        setShowSuccess(false);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, migrating, migrationError, onClose, onSuccess]);

  // Show migration in progress
  if (migrating) {
    return (
      <Modal isOpen={isOpen} onClose={() => {}}>
        <div className="bg-slate-900 rounded-xl max-w-md w-full p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            <h3 className="text-xl font-semibold text-white">
              Syncing your data to cloud...
            </h3>
            <p className="text-slate-400 text-sm text-center">
              This may take a few moments. Please don't close this window.
            </p>
          </div>
        </div>
      </Modal>
    );
  }

  // Show success state
  if (showSuccess) {
    return (
      <Modal isOpen={isOpen} onClose={() => {}}>
        <div className="bg-slate-900 rounded-xl max-w-md w-full p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <CheckCircle className="w-12 h-12 text-green-500" />
            <h3 className="text-xl font-semibold text-white">Sync complete!</h3>
            <p className="text-slate-400 text-sm text-center">
              Your data has been successfully synced to the cloud.
            </p>
          </div>
        </div>
      </Modal>
    );
  }

  // Show migration error
  if (migrationError) {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="bg-slate-900 rounded-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Sync Failed</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex items-start space-x-3 mb-6">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-medium mb-2">
                Failed to sync your data to cloud
              </p>
              <p className="text-slate-400 text-sm">{migrationError}</p>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Continue Without Sync
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Retry Sync
            </button>
          </div>

          <p className="text-slate-500 text-xs text-center mt-4">
            You can continue using the app with local storage. Your data will be
            available on this device only.
          </p>
        </div>
      </Modal>
    );
  }

  // Show auth form (normal state)
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
