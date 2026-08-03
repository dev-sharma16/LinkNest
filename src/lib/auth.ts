import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";
import { env, APP_URL } from "@/lib/env";
import { buildVerificationEmail, buildPasswordResetEmail, sendEmail } from "@/lib/email";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  appName: "LinkNest",
  baseURL: (env.BETTER_AUTH_URL ?? APP_URL) as string,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        ...buildPasswordResetEmail(url, user.name),
      });
    },
    resetPasswordTokenExpiresIn: 3600,
    resetPasswordTokenMaxUses: 3,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        ...buildVerificationEmail(url, user.name),
      });
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // refresh every 24h
  },
  plugins: [nextCookies()],
});