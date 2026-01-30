"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:5000";

export function DeleteMedicineButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  const onDelete = async () => {
    if (pending) return;
    const ok = window.confirm(`Delete "${name}"? This cannot be undone.`);
    if (!ok) return;

    setPending(true);
    const t = toast.loading("Deleting...");

    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/seller/medicines/${id}`, {
        method: "DELETE",
        credentials: "include", // ✅ send cookies
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        toast.error(`Delete failed`, { id: t });
        console.log(txt);
        return;
      }

      toast.success("Deleted successfully", { id: t });
      router.refresh();
    } catch {
      toast.error("Something went wrong", { id: t });
    } finally {
      setPending(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="btn-outline"
      onClick={onDelete}
      disabled={pending}
    >
      {pending ? "Deleting..." : "Delete"}
    </Button>
  );
}
