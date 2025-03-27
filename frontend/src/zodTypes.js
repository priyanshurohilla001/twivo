import { z } from "zod";

export const usernameSchema = z.object({
    username: z
      .string()
      .min(6, "Username must be at least 6 characters")
      .max(12, "Username must be at most 12 characters")
      .regex(
        /^[a-zA-Z0-9]+$/,
        "Username must contain only alphanumeric characters"
      ),
  });
