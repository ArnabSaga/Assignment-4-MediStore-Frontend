import { ShopPage } from "@/components/shop/shop-page";

export type ShopSearchParams = {
  category?: string;
  q?: string;
  sort?: string;
  page?: string;
};

export default async function ShopRoute({
  searchParams,
}: {
  searchParams: Promise<ShopSearchParams>;
}) {
  const sp = await searchParams;
  return <ShopPage searchParams={sp} />;
}
