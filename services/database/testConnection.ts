import { supabase } from "./supabaseClient";

/**
 * Test Supabase connection and authentication
 * Run this to verify database setup is complete
 */
export async function testConnection(): Promise<void> {
  console.log("🔍 Testing Supabase connection...");

  try {
    // Test 1: Check if client is initialized
    if (!supabase) {
      throw new Error("Supabase client not initialized");
    }
    console.log("✅ Supabase client initialized");

    // Test 2: Test database connection
    const { data: testData, error: testError } = await supabase
      .from("profiles")
      .select("count")
      .limit(1);

    if (testError) {
      console.warn("⚠️  Database query failed:", testError.message);
      console.warn(
        "   This is expected if you haven't run schema.sql yet in Supabase"
      );
    } else {
      console.log("✅ Database connection successful");
    }

    // Test 3: Check auth session
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      console.log("✅ User authenticated:", session.user.email);
    } else {
      console.log("ℹ️  No active session (guest mode)");
    }

    console.log("🎉 Connection test complete!");
  } catch (error) {
    console.error("❌ Connection test failed:", error);
  }
}

// Auto-run in development
if (import.meta.env.DEV) {
  testConnection();
}
