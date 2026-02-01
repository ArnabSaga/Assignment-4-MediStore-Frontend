import { serverApi } from "@/lib/server-api";
import { Separator } from "@/components/ui/separator";
import { ProfileForm } from '@/components/account/profile-form';

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

export default async function AccountProfilePage() {
  const me = await serverApi<MeUser>("/users/me", { cache: "no-store" });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Personal info</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your personal details and account information.
        </p>
      </div>

      <Separator className="mb-6" />

      <ProfileForm initialMe={me} />
    </div>
  );
}
