import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export function ProductCard({
  product,
}: {
  product: {
    id: string;
    name: string;
    price: number;
    salePrice?: number;
    image: string;
  };
}) {
  const hasDiscount = product.salePrice && product.salePrice < product.price;

  return (
    <Link href={`/shop/${product.id}`} className="group">
      <Card className="overflow-hidden transition-all hover:shadow-md">
        <CardContent className="p-0">
          <div className="relative aspect-square bg-muted">
            {hasDiscount && (
              <span className="absolute left-2 top-2 z-10 rounded bg-primary px-2 py-1 text-xs text-primary-foreground">
                SALE
              </span>
            )}
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          </div>

          <div className="p-3">
            <p className="line-clamp-2 text-sm font-medium">{product.name}</p>

            <div className="mt-2 flex items-center gap-2">
              {hasDiscount ? (
                <>
                  <span className="text-sm font-semibold">
                    ৳{product.salePrice}
                  </span>
                  <span className="text-xs text-muted-foreground line-through">
                    ৳{product.price}
                  </span>
                </>
              ) : (
                <span className="text-sm font-semibold">৳{product.price}</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
