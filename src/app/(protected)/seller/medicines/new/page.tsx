import { cookies } from "next/headers";

import { CreateMedicineForm } from "@/components/seller/create-medicine-form";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:5000";

type Category = { id: string; name: string; slug: string };

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

async function fetchCategories(): Promise<Category[]> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const res = await fetch(`${BACKEND_URL}/api/v1/categories`, {
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Failed to fetch categories: ${res.status} ${txt}`);
  }

  const json = (await res.json()) as ApiResponse<Category[]>;
  return json.data ?? [];
}

export default async function NewMedicinePage() {
  const categories = await fetchCategories();
  return <CreateMedicineForm categories={categories} />;
}
