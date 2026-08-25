import "../../../infrastructure/local/__tests__/setup";
import { indexedDB } from "fake-indexeddb";
import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RepositoryContext } from "@app/RepositoryProvider";
import { createRepositories } from "@app/repositoryFactory";
import { resetDbForTests } from "@infrastructure/local/db";
import { AnalyzerPage } from "../AnalyzerPage";

beforeEach(async () => {
  await resetDbForTests();
  for (const dbInfo of await indexedDB.databases()) {
    if (dbInfo.name) {
      await new Promise<void>((resolve, reject) => {
        const request = indexedDB.deleteDatabase(dbInfo.name!);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
        request.onblocked = () => resolve();
      });
    }
  }
});

async function renderAnalyzerPageForProfile() {
  const repos = createRepositories({ mode: "local" });
  await repos.benchmarkRepo.seedIfEmpty?.();
  await repos.profileRepo.createProfile({
    fullName: "Test User",
    experienceYears: 5,
    industry: "IT Services",
    currentRole: "Software Engineer",
    location: "Bangalore",
    currentCtc: 1800000,
  });

  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <RepositoryContext.Provider value={repos}>
        <AnalyzerPage />
      </RepositoryContext.Provider>
    </QueryClientProvider>,
  );
}

describe("AnalyzerPage — self analysis, end to end through the real component tree", () => {
  it("prefills Annual CTC from the profile's Current CTC", async () => {
    await renderAnalyzerPageForProfile();

    await waitFor(() => {
      expect(screen.getByDisplayValue("18,00,000")).toBeInTheDocument();
    });
  });

  it("shows an explicit Save button (not an auto-saved note) after analyzing for myself", async () => {
    await renderAnalyzerPageForProfile();

    await waitFor(() => {
      expect(screen.getByDisplayValue("18,00,000")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Analyze" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Save this analysis" })).toBeInTheDocument();
    });
  });

  it("clears the displayed result and its own field values when switching to 'For someone else'", async () => {
    await renderAnalyzerPageForProfile();

    await waitFor(() => {
      expect(screen.getByDisplayValue("18,00,000")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Analyze" }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Save this analysis" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "For someone else" }));

    // The stale result panel (and its Save button) must be gone...
    expect(screen.queryByRole("button", { name: "Save this analysis" })).not.toBeInTheDocument();
    expect(screen.queryByText(/Result/)).not.toBeInTheDocument();
    // ...and the form must no longer show the self-profile's prefilled CTC.
    expect(screen.queryByDisplayValue("18,00,000")).not.toBeInTheDocument();
  });
});
