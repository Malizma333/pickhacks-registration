import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "~/server/db";
import * as schema from "~/server/db/schema";
import { env } from "~/env";
import { resend } from "~/lib/email-client";

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
    sendResetPassword: async ({ user, token }) => {
      const resetUrl = `${env.BETTER_AUTH_URL}/reset-password?token=${token}`;
      console.info(`Password reset sent: ${user.email} ${user.name} ${resetUrl}`);
      await resend.emails.send({
        from: 'PickHacks <mst@pickhacks.io>',
        to: user.email,
        subject: 'Reset password',
        html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      // For now, we'll log the verification URL to console
      // In production, this will send an actual email using Resend or similar
      console.info(`Verification sent: ${user.email} ${user.name} ${url}
      `);
      await resend.emails.send({
        from: 'PickHacks <mst@pickhacks.io>',
        to: user.email,
        subject: 'Verify your PickHacks account',
        html: `<p>Click <a href="${url}">here</a> to verify your email.</p>`,
      });
    },
  },
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL ?? "http://localhost:3000",
  trustedOrigins: [
    "http://localhost:3000",
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : [])
  ],
  advanced: {
    useSecureCookies: true,
  }
});


export type Session = typeof auth.$Infer.Session;
