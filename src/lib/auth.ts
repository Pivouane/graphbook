import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

import { magicLink } from "better-auth/plugins";
import { Resend } from "resend";
import { EmailTemplate } from "@/components/email-template";

const client = new MongoClient(process.env.DATABASE_URL!);
const db = client.db();

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  database: mongodbAdapter(db),
  user: {
    modelName: "User",
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "user",
        input: false,
      },
      providers: {
        type: "string[]",
        required: true,
        defaultValue: ["email"],
        input: false,
      },
      quote: {
        type: "string",
        required: false,
        defaultValue: "",
        input: true,
      },
      promo: {
        type: "string",
        required: false,
        defaultValue: "",
        input: true,
      },
    },
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, token, url }, request) => {
        const { data, error } = await resend.emails.send({
          from: "Acme <onboarding@resend.dev>",
          to: ["delivered@resend.dev"],
          subject: "Hello world",
          react: await EmailTemplate({ firstName: "John" }),
        });

        if (error) {
          console.error(error);
        }

        console.log(
          `Magic link sent to ${email} with token ${token} at ${url}`,
        );
      },
    }),
  ],
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  rateLimit: {
    max: 100,
    window: 10,
    storage: "database",
    modelName: "rateLimit",
  },
  fetchOptions: {
    onError: async (context: any) => {
      const { response } = context;
      if (response.status === 429) {
        const retryAfter = response.headers.get("X-Retry-After");
        console.log(`Rate limit exceeded. Retry after ${retryAfter} seconds`);
      }
    },
  },
});
