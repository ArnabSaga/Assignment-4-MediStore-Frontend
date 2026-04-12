"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart-store";
import { PRODUCT_IMAGE_MAP } from "@/lib/product-images";
import { useSession } from "@/hooks/use-session";

type AddToCartButtonProps = {
  id: string;
  slug?: string;
  name: string;
  price: number | string;
  manufacturer?: string | null;
  imageUrl?: string | null;
};

export function AddToCartButton(props: AddToCartButtonProps) {
  const router = useRouter();
  const { user } = useSession();
  const add = useCartStore((s) => s.add);

  const image = useMemo(() => {
    const direct =
      props.imageUrl && props.imageUrl.trim() ? props.imageUrl : null;
    return (
      direct ??
      (props.slug ? PRODUCT_IMAGE_MAP[props.slug] : undefined) ??
      "/images/placeholder.png"
    );
  }, [props.imageUrl, props.slug]);

  return (
    <Button
      size="lg"
      className="btn-primary w-full sm:w-auto"
      onClick={() => {
        if (!user) {
          router.push("/register");
          return;
        }

        add({
          id: props.id,
          slug: props.slug,
          name: props.name,
          price: props.price,
          manufacturer: props.manufacturer ?? undefined,
          image,
        });

        router.push("/cart");
      }}
    >
      Add to Cart
    </Button>
  );
}
