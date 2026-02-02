"use client";

import * as React from "react";
import { authClient } from "@/lib/auth-client";

export type Role = "CUSTOMER" | "SELLER" | "ADMIN";

export type AppSessionUser = {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: Role;
};

type AnySessionResponse = {
  user?: AppSessionUser | null;
  data?: { user?: AppSessionUser | null } | null;
} | null;

export function useSession() {
  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState<AppSessionUser | null>(null);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = (await authClient
        .getSession()
        .catch(() => null)) as AnySessionResponse;

      const u = (res?.user ?? res?.data?.user ?? null) as AppSessionUser | null;
      setUser(u);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  return { loading, user, refresh };
}
