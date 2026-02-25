import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { magicLink } from "better-auth/plugins";
import { prisma } from "@/lib/prisma/client";

const federatedEmailDomains = process.env.BETTER_AUTH_FEDERATED_EMAIL_DOMAINS
  ? process.env.BETTER_AUTH_FEDERATED_EMAIL_DOMAINS.split(",").map((d) =>
      d.trim().toLowerCase()
    )
  : [];


export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "mongodb",
  }),
  advanced: {
    database: {
      generateId: false,
    },
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        if (!federatedEmailDomains.some((domain) => email.endsWith(`@${domain}`))) {
          throw new Error("Email domain not allowed");
        }
        // TODO: Connect the email provider
        console.log(`Magic link for ${email}: ${url}`);
      },
    }),
  ],
  trustedOrigins: [process.env.BETTER_AUTH_URL!],
});
