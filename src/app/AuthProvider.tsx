import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Profile } from "@domain/models";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  experienceYears: number;
  industry: string;
  currentRole: string;
  location: string;
}

interface AuthContextValue {
  status: AuthStatus;
  profile: Profile | null;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => string | null;
  setAccessToken: (token: string | null) => void;
  /** Called by the http client when a refresh attempt fails mid-session. */
  sessionExpired: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Defensive: a crashed/misconfigured backend or a proxy error page can
// return an empty or non-JSON body. Falling back to `{}` instead of
// `undefined` means callers checking `data.someField` get `undefined`
// (a normal falsy check), not a "Cannot read properties of undefined" crash.
async function readJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return {} as T;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [profile, setProfile] = useState<Profile | null>(null);
  const accessTokenRef = useRef<string | null>(null);
  const queryClient = useQueryClient();

  const getAccessToken = useCallback(() => accessTokenRef.current, []);
  const setAccessToken = useCallback((token: string | null) => {
    accessTokenRef.current = token;
  }, []);

  const applySession = useCallback((accessToken: string, nextProfile: Profile) => {
    setAccessToken(accessToken);
    setProfile(nextProfile);
    setStatus("authenticated");
  }, [setAccessToken]);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setProfile(null);
    setStatus("unauthenticated");
    // Prevent the next account (or a re-login) from ever flashing a
    // previous session's cached profile/entries/history/etc.
    queryClient.clear();
  }, [setAccessToken, queryClient]);

  // Restore a session across page reloads: the access token only ever lives
  // in memory, so on mount we silently trade the httpOnly refresh cookie for
  // a new one via /api/auth/refresh, then fetch the profile.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const refreshResponse = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        });
        if (!refreshResponse.ok) throw new Error("no session");
        const { accessToken } = await readJson<{ accessToken: string }>(refreshResponse);

        const meResponse = await fetch("/api/users/me", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!meResponse.ok) throw new Error("no profile");
        const me = await readJson<Profile>(meResponse);

        if (!cancelled) applySession(accessToken, me);
      } catch {
        if (!cancelled) clearSession();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [applySession, clearSession]);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await readJson<{ accessToken?: string; profile?: Profile; error?: string }>(response);
      if (!response.ok || !data.accessToken || !data.profile) {
        throw new Error(data.error ?? "Login failed.");
      }
      applySession(data.accessToken, data.profile);
    },
    [applySession],
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await readJson<{ accessToken?: string; profile?: Profile; error?: string }>(response);
      if (!response.ok || !data.accessToken || !data.profile) {
        throw new Error(data.error ?? "Registration failed.");
      }
      applySession(data.accessToken, data.profile);
    },
    [applySession],
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" }).catch(() => {});
    clearSession();
  }, [clearSession]);

  return (
    <AuthContext.Provider
      value={{
        status,
        profile,
        login,
        register,
        logout,
        getAccessToken,
        setAccessToken,
        sessionExpired: clearSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
