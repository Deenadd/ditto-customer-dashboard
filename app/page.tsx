import { SignInFlow } from "@/components/login-form";

/**
 * Sign in. Layout from node 149:10704 ("Ditto - Home - Life Insurance"),
 * with the glow from the reference in place of the 3D illustrations, and
 * the code step from the older "Ditto - Link - Confirm phone".
 */
export default function LoginPage() {
  return (
    <main id="main" className="relative isolate flex min-h-dvh flex-col items-center overflow-x-hidden bg-page">
      {/* Safari on iOS 26 fills the status bar with the page's background
          colour, which was white over the wash. Behind this page only, the
          background is the wash's colour along its top edge; the page itself
          stays white, so it shows just in the status bar and the overscroll. */}
      <style>{"html,body{background-color:#b7d5f5}"}</style>
      <SignInFlow />
    </main>
  );
}
