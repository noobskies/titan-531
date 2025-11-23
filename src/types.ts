export interface UserProfile {
  id: string;
  email: string | undefined;
  display_name?: string;
  avatar_url?: string;
  created_at?: string;
}

export interface AuthError {
  message: string;
}
