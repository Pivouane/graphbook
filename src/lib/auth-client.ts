import { magicLinkClient } from "better-auth/client/plugins";
import { magicLink } from "better-auth/plugins";
import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({
  plugins: [magicLinkClient()],
});
