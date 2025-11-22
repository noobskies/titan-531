import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "../services/database/supabaseClient";
import { migrateGuestDataToCloud } from "../services/database/migrationService";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  migrating: boolean;
  migrationError: string | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [migrating, setMigrating] = useState(false);
  const [migrationError, setMigrationError] = useState<string | null>(null);

  useEffect(() => {
    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Trigger migration if authenticated
      if (session?.user) {
        checkAndMigrate(session.user.id);
      }
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Trigger migration on sign in (covers both signup and signin)
      if (session?.user && event === "SIGNED_IN") {
        await checkAndMigrate(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Check and trigger migration if needed
  const checkAndMigrate = async (userId: string) => {
    try {
      setMigrating(true);
      setMigrationError(null);

      // Run migration
      const result = await migrateGuestDataToCloud(userId);

      if (!result.success) {
        setMigrationError(result.error || "Migration failed");
        console.error("Migration failed:", result.error);
      } else {
        // Log successful migration
        if (result.details && result.details.profileMigrated) {
          console.log("Migration completed:", result.details);
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setMigrationError(errorMessage);
      console.error("Migration error:", error);
    } finally {
      setMigrating(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
  };

  const value = {
    user,
    session,
    loading,
    migrating,
    migrationError,
    isAuthenticated: !!user,
    isGuest: !user,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
