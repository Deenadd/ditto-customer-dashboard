import { SignInFlow } from "@/components/login-form";

/**
 * Sign in. Layout from node 149:10704 ("Ditto - Home - Life Insurance"),
 * with the glow from the reference in place of the 3D illustrations, and
 * the code step from the older "Ditto - Link - Confirm phone".
 */
export default function LoginPage() {
  return (
    <main id="main" className="relative isolate flex min-h-dvh flex-col items-center overflow-x-hidden">
      <SignInFlow />
    </main>
  );
}
