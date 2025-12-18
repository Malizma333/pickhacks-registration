import { cookies } from "next/headers";
import { auth } from "~/server/auth";

export async function getSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("better-auth.session_token");

  if (!sessionToken) {
    return null;
  }

  try {
    const session = await auth.api.getSession({
      headers: {
        cookie: `better-auth.session_token=${sessionToken.value}`,
      },
    });

    return session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

export async function requireAuth() {
  const session = await getSession();

  if (!session || !session.user) {
    return { authenticated: false, user: null, session: null };
  }

  return { authenticated: true, user: session.user, session };
}

export async function requireEmailVerification() {
  const { authenticated, user, session } = await requireAuth();

  if (!authenticated || !user) {
    return { authenticated: false, emailVerified: false, user: null, session: null };
  }

  const emailVerified = user.emailVerified ?? false;

  return { authenticated, emailVerified, user, session };
}
