import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { createRepositories, resolveDataMode, type Repositories } from "./repositoryFactory";
import { useAuth } from "./AuthProvider";

const RepositoryContext = createContext<Repositories | null>(null);

async function bootstrapLocalData(repos: Repositories): Promise<void> {
  if (repos.benchmarkRepo.seedIfEmpty) {
    await repos.benchmarkRepo.seedIfEmpty();
  }
}

export function RepositoryProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  // Deliberately NOT memoized on auth.status/profile — getAccessToken/
  // setAccessToken/logout are stable callbacks (useCallback in AuthProvider),
  // so the httpClient's closures always read the *current* token without
  // the repository objects themselves needing to be recreated on refresh.
  const repos = useMemo(
    () =>
      createRepositories({
        mode: resolveDataMode(),
        httpClientDeps: {
          getAccessToken: auth.getAccessToken,
          onTokenRefreshed: auth.setAccessToken,
          onAuthExpired: auth.sessionExpired,
        },
      }),
    [auth.getAccessToken, auth.setAccessToken, auth.sessionExpired],
  );

  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    bootstrapLocalData(repos).then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [repos]);

  if (!ready) {
    return null;
  }

  return <RepositoryContext.Provider value={repos}>{children}</RepositoryContext.Provider>;
}

export function useRepositories(): Repositories {
  const ctx = useContext(RepositoryContext);
  if (!ctx) {
    throw new Error("useRepositories must be used within a RepositoryProvider");
  }
  return ctx;
}
