export async function resendVerificationEmail(
  email: string,
  next: string = "/"
) {
  if (!email) throw new Error("Email is required");

  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

  const callbackURL = new URL(next, origin).toString();

  const res = await fetch("/api/auth/send-verification-email", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, callbackURL }),
    cache: "no-store",
  });

  const json = (await res.json().catch(() => null)) as {
    success?: boolean;
    message?: string;
  } | null;

  if (!res.ok) {
    throw new Error(json?.message || `Failed (${res.status})`);
  }

  if (json?.success === false) {
    throw new Error(json.message || "Failed to resend verification email");
  }

  return true;
}
