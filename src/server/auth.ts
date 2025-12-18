import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "~/server/db";
import * as schema from "~/server/db/schema";
import { env } from "~/env";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day - update session every day instead of every request
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes - cache session in cookie
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      // For now, we'll log the verification URL to console
      // In production, this will send an actual email using Resend or similar
      console.log(`
========================================
Email Verification Required
========================================
User: ${user.email}
Name: ${user.name}
Verification URL: ${url}
========================================
      `);

      // TODO: Implement actual email sending with Resend
      // Example:
      // await resend.emails.send({
      //   from: 'PickHacks <noreply@pickhacks.com>',
      //   to: user.email,
      //   subject: 'Verify your PickHacks account',
      //   html: `<p>Click <a href="${url}">here</a> to verify your email.</p>`,
      // });
    },
  },
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL ?? "http://localhost:3000",
});

export type Session = typeof auth.$Infer.Session;
