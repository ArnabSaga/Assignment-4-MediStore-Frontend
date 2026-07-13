import { CreateMedicineForm } from "@/components/seller/create-medicine-form";
import { DashboardPageHeader, DashboardPanel } from "@/components/dashboard";

import { serverApi } from "@/lib/server-api";
import type { Category } from "@/types/api";

async function fetchCategories(): Promise<Category[]> {
  return serverApi<Category[]>("/categories?limit=100");
}

export default async function NewMedicinePage() {
  const categories = await fetchCategories();
  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Add Medicine"
        description="Create a new seller-owned medicine listing."
        breadcrumbs={[
          { label: "Seller", href: "/seller/dashboard" },
          { label: "Medicines", href: "/seller/medicines" },
          { label: "Add Medicine" },
        ]}
      />
      <DashboardPanel>
        <CreateMedicineForm categories={categories} />
      </DashboardPanel>
    </div>
  );
}
