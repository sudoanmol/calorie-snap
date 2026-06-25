import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

// Only these emails may sign up / sign in. Set on the deployment with:
//   npx convex env set ALLOWED_EMAILS you@example.com
// (comma-separated for more than one). If unset, sign-up is open — so set it.
const allowedEmails = (process.env.ALLOWED_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile(params) {
        const email = String(params.email ?? "").trim().toLowerCase();
        if (allowedEmails.length > 0 && !allowedEmails.includes(email)) {
          throw new Error("This email is not allowed.");
        }
        return { email };
      },
    }),
  ],
});
