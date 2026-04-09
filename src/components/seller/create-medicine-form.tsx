"use client";

import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { clientApi } from "@/lib/client-api";
import { uploadImage } from "@/lib/upload";
import { cn } from "@/lib/utils";
import { Category } from "@/types/api";
import { Input } from "../ui/input";

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
  const [uploading, setUploading] = React.useState(false);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (v: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const t = toast.loading("Uploading image...");

    try {
      const { url } = await uploadImage(file);
      onChange(url);
      toast.success("Image uploaded 📸", { id: t });
    } catch (err) {
      console.error(err);
      toast.error("Upload failed", { id: t });
    } finally {
      setUploading(false);
    }
  };

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
          imageUrl: parsed.data.imageUrl?.trim() ? parsed.data.imageUrl.trim() : undefined,
          description: parsed.data.description?.trim() ? parsed.data.description.trim() : undefined,
          isActive: Boolean(parsed.data.isActive ?? true),
        };

        await clientApi("/seller/medicines", {
          method: "POST",
          body: payload,
        });

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
          <h1 className="text-2xl font-semibold tracking-tight">New Medicine</h1>
          <p className="text-sm text-muted-foreground">Add a new medicine to your store.</p>
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
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field>
                      <FieldLabel>Name</FieldLabel>
                      <Input
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        placeholder="Napa 500mg"
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="manufacturer">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field>
                      <FieldLabel>Manufacturer</FieldLabel>
                      <Input
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        placeholder="Square Pharmaceuticals"
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
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
                    <FieldDescription>Select the correct category.</FieldDescription>
                  </Field>
                )}
              </form.Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <form.Field name="price">
                  {(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field>
                        <FieldLabel>Price</FieldLabel>
                        <Input
                          type="number"
                          value={String(field.state.value)}
                          onChange={(e) => field.handleChange(Number(e.target.value))}
                          onBlur={field.handleBlur}
                          min={1}
                          step="0.01"
                        />
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </form.Field>

                <form.Field name="stock">
                  {(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field>
                        <FieldLabel>Stock</FieldLabel>
                        <Input
                          type="number"
                          value={String(field.state.value)}
                          onChange={(e) => field.handleChange(Number(e.target.value))}
                          onBlur={field.handleBlur}
                          min={0}
                          step={1}
                        />
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </form.Field>
              </div>

              <form.Field name="imageUrl">
                {(field) => (
                  <Field>
                    <FieldLabel>Medicine Image</FieldLabel>
                    <div className="flex flex-col gap-3">
                      {field.state.value && (
                        <div className="relative h-40 w-full overflow-hidden rounded-md border border-border bg-muted">
                          <img
                            src={field.state.value}
                            alt="Preview"
                            className="h-full w-full object-contain"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute right-2 top-2 h-8 w-8"
                            onClick={() => field.handleChange("")}
                          >
                            ×
                          </Button>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id="image-upload"
                          onChange={(e) => handleFileUpload(e, field.handleChange)}
                          disabled={uploading || pending}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full border-dashed"
                          onClick={() => document.getElementById("image-upload")?.click()}
                          disabled={uploading || pending}
                        >
                          {uploading ? "Uploading..." : "Upload Image"}
                        </Button>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="h-px flex-1 bg-border" />
                        <span>OR</span>
                        <span className="h-px flex-1 bg-border" />
                      </div>

                      <Input
                        value={field.state.value ?? ""}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        placeholder="Paste image URL here..."
                        disabled={uploading || pending}
                      />
                    </div>
                  </Field>
                )}
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
              <Button type="submit" className="btn-primary w-full sm:w-auto" disabled={pending}>
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
