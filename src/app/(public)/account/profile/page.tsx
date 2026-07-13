import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ProfileForm } from '@/components/account/profile-form';
import { ApiError, serverApi } from "@/lib/server-api";

type Role = "CUSTOMER" | "SELLER" | "ADMIN";

type MeUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  phone: string | null;
  image: string | null;
  role: Role;
  isBanned: boolean;
  createdAt: string;
  updatedAt?: string;
};

type ProfileState =
  | { status: "ready"; me: MeUser }
  | { status: "unauthenticated" }
  | { status: "error"; message: string };

async function getProfileState(): Promise<ProfileState> {
  try {
    const me = await serverApi<MeUser>("/users/me", { cache: "no-store" });

    return { status: "ready", me };
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      return { status: "unauthenticated" };
    }

    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "We could not load your profile right now.",
    };
  }
}

export default async function AccountProfilePage() {
  const profileState = await getProfileState();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Personal info</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your personal details and account information.
        </p>
      </div>

      <Separator className="mb-6" />

      {profileState.status === "ready" ? (
        <ProfileForm initialMe={profileState.me} />
      ) : profileState.status === "unauthenticated" ? (
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Login required</h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Please log in to view and update your profile information.
          </p>
          <Button asChild className="mt-5">
            <Link href="/login?next=/account/profile">Go to login</Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Profile unavailable</h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            {profileState.message}
          </p>
          <Button asChild className="mt-5" variant="outline">
            <Link href="/account/profile">Try again</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
