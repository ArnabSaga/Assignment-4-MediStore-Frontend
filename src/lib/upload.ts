import { clientApi } from "./client-api";

/**
 * Uploads an image to Cloudinary via the backend proxy.
 * This keeps Cloudinary credentials secure and centralized in the backend.
 */
export async function uploadImage(file: File): Promise<{ url: string; publicId: string }> {
  const formData = new FormData();
  formData.append("image", file);

  // Note: clientApi usually expects JSON. For multipart/form-data, we need a slight modification
  // or use a direct fetch. Let's use direct fetch to stay compatible with FormData easily.
  
  const response = await fetch("/api/v1/uploads", {
    method: "POST",
    body: formData,
    // Note: Better Auth session is handled by cookies automatically with credentials: "include"
    // However, fetch on the same origin inherits credentials by default.
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to upload image");
  }

  const result = await response.json();
  return result.data;
}
