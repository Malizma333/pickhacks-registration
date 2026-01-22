import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  fetchOptions: {
    cache: "no-store", // Prevent stale data
  },
});

