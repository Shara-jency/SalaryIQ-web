// Standalone auth flows (no session involved), so — like login/register in
// AuthProvider — these call the API directly rather than through a
// repository; there's no domain model or storage concern here, just an
// account action.

async function readJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export async function requestPasswordReset(
  email: string,
): Promise<{ message: string; devResetUrl?: string }> {
  const response = await fetch("/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await readJson<{ message?: string; devResetUrl?: string; error?: string }>(response);
  if (!response.ok) {
    throw new Error(data.error ?? "Something went wrong. Please try again.");
  }
  return { message: data.message ?? "If an account exists for that email, a reset link has been sent.", devResetUrl: data.devResetUrl };
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const response = await fetch("/api/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword }),
  });
  const data = await readJson<{ error?: string }>(response);
  if (!response.ok) {
    throw new Error(data.error ?? "Unable to reset your password.");
  }
}
