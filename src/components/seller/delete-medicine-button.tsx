"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

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
      const res = await fetch(`/api/v1/seller/medicines/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        toast.error("Delete failed", { id: t });
        return;
      }

      // backend may or may not return json
      const json = (await res.json().catch(() => null)) as {
        success?: boolean;
        message?: string;
      } | null;

      if (json && json.success === false) {
        toast.error(json.message || "Delete failed", { id: t });
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
