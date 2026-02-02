import { createEnv } from "@t3-oss/env-nextjs";
import * as z from "zod";

export const env = createEnv({
  server: {
    BACKEND_URL: z.string().url(),
  },

  client: {
    NEXT_PUBLIC_FRONTEND_URL: z.string().url(),

    NEXT_PUBLIC_API_URL: z.string().min(1),

    NEXT_PUBLIC_AUTH_URL: z.string().min(1),
  },

  runtimeEnv: {
    BACKEND_URL: process.env.BACKEND_URL ?? "",
    NEXT_PUBLIC_FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL ?? "",
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "",
    NEXT_PUBLIC_AUTH_URL: process.env.NEXT_PUBLIC_AUTH_URL ?? "",
  },
});
