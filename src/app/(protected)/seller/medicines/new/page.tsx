import { cookies } from "next/headers";

import { CreateMedicineForm } from "@/components/seller/create-medicine-form";

import { serverApi } from "@/lib/server-api";
import type { Category } from "@/types/api";

async function fetchCategories(): Promise<Category[]> {
  return serverApi<Category[]>("/categories?limit=100");
}

export default async function NewMedicinePage() {
  const categories = await fetchCategories();
  return <CreateMedicineForm categories={categories} />;
}
