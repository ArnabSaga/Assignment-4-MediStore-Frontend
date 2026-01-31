"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Category = { id: string; name: string; slug: string };

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  manufacturer: z.string().min(2, "Manufacturer must be at least 2 characters"),
  categoryId: z.string().min(1, "Category is required"),
  price: z.coerce.number().positive("Price must be positive"),
  stock: z.coerce.number().int().min(0, "Stock must be 0 or more"),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  isActive: z.boolean().optional(),
});

export function CreateMedicineForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      manufacturer: "",
      categoryId: categories?.[0]?.id ?? "",
      price: 10,
      stock: 0,
      imageUrl: "",
      description: "",
      isActive: true,
    },

    onSubmit: async ({ value }) => {
      if (pending) return;

      const parsed = schema.safeParse(value);
      if (!parsed.success) {
        toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
        return;
      }

      setPending(true);
      const t = toast.loading("Creating medicine...");

      try {
        const payload = {
          name: parsed.data.name,
          manufacturer: parsed.data.manufacturer,
          categoryId: parsed.data.categoryId,
          price: Number(parsed.data.price),
          stock: Number(parsed.data.stock),
          imageUrl: parsed.data.imageUrl?.trim()
            ? parsed.data.imageUrl.trim()
            : undefined,
          description: parsed.data.description?.trim()
            ? parsed.data.description.trim()
            : undefined,
          isActive: Boolean(parsed.data.isActive ?? true),
        };

        const res = await fetch(`/api/v1/seller/medicines`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          console.log("CREATE MEDICINE FAILED:", res.status, text);
          toast.error("Create failed", { id: t });
          return;
        }

        toast.success("Medicine created ✅", { id: t });
        router.push("/seller/medicines");
        router.refresh();
      } catch (err) {
        console.log(err);
        toast.error("Something went wrong", { id: t });
      } finally {
        setPending(false);
      }
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            New Medicine
          </h1>
          <p className="text-sm text-muted-foreground">
            Add a new medicine to your store.
          </p>
        </div>

        <Button asChild variant="outline" className="btn-outline">
          <Link href="/seller/medicines">Back</Link>
        </Button>
      </div>

      <Card className="card-surface">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Medicine Details</CardTitle>
        </CardHeader>

        <CardContent>
          <form
            className={cn("flex flex-col gap-6")}
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              <form.Field name="name">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field>
                      <FieldLabel>Name</FieldLabel>
                      <Input
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        placeholder="Napa 500mg"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="manufacturer">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field>
                      <FieldLabel>Manufacturer</FieldLabel>
                      <Input
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        placeholder="Square Pharmaceuticals"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="categoryId">
                {(field) => (
                  <Field>
                    <FieldLabel>Category</FieldLabel>
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <FieldDescription>
                      Select the correct category.
                    </FieldDescription>
                  </Field>
                )}
              </form.Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <form.Field name="price">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field>
                        <FieldLabel>Price</FieldLabel>
                        <Input
                          type="number"
                          value={String(field.state.value)}
                          onChange={(e) =>
                            field.handleChange(Number(e.target.value))
                          }
                          onBlur={field.handleBlur}
                          min={1}
                          step="0.01"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                </form.Field>

                <form.Field name="stock">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field>
                        <FieldLabel>Stock</FieldLabel>
                        <Input
                          type="number"
                          value={String(field.state.value)}
                          onChange={(e) =>
                            field.handleChange(Number(e.target.value))
                          }
                          onBlur={field.handleBlur}
                          min={0}
                          step={1}
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                </form.Field>
              </div>

              <form.Field name="imageUrl">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field>
                      <FieldLabel>Image URL (optional)</FieldLabel>
                      <Input
                        value={field.state.value ?? ""}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        placeholder="https://..."
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="description">
                {(field) => (
                  <Field>
                    <FieldLabel>Description (optional)</FieldLabel>
                    <textarea
                      className="min-h-27.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      value={field.state.value ?? ""}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder="Short description..."
                    />
                  </Field>
                )}
              </form.Field>

              <form.Field name="isActive">
                {(field) => (
                  <Field>
                    <div className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2">
                      <div className="space-y-0.5">
                        <FieldLabel>Active</FieldLabel>
                        <p className="text-xs text-muted-foreground">
                          If off, this medicine will be hidden from shop.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={Boolean(field.state.value)}
                        onChange={(e) => field.handleChange(!!e.target.checked)}
                      />
                    </div>
                  </Field>
                )}
              </form.Field>
            </FieldGroup>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                type="submit"
                className="btn-primary w-full sm:w-auto"
                disabled={pending}
              >
                {pending ? "Creating..." : "Create Medicine"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="btn-outline w-full sm:w-auto"
                onClick={() => router.push("/seller/medicines")}
                disabled={pending}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
