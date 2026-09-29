import Image from "next/image";
import { LoginForm } from "@/components/login-form";
import { Glow } from "@/components/ui/asset";

/** Sign in, from node 149:10704 ("Ditto - Home - Life Insurance"). */
export default function LoginPage() {
  return (
    <main
      id="main"
      className="relative isolate flex min-h-[max(100dvh,760px)] flex-col items-center justify-center overflow-hidden bg-surface px-6 pt-10 pb-[180px]"
    >
      <div aria-hidden className="absolute inset-0 -z-10">
        <Glow src="/login/glow-1453.svg" size={592} bleed="-101.35%" style={{ left: -194, top: 274 }} />
        <Glow
          src="/login/glow-1454.svg"
          size={592}
          bleed="-101.35%"
          style={{ left: "calc(75% - 69px)", top: -70 }}
        />
        <Glow
          src="/login/glow-1455.svg"
          size={592}
          bleed="-101.35%"
          style={{ left: "calc(75% - 69px)", top: 524 }}
        />
      </div>

      <Image
        src="/brand/ditto-logo.png"
        alt="Ditto"
        width={663}
        height={307}
        priority
        className="h-[46px] w-[99px] object-contain"
      />
      <h1 className="mt-8 max-w-[440px] text-center text-[40px] leading-[44px] font-bold tracking-[-0.035em] text-balance text-label max-sm:text-[32px] max-sm:leading-9">
        Insurance, made simple.
      </h1>
      <p className="mt-3 max-w-[340px] text-center text-[17px] leading-6 text-pretty text-label-secondary">
        Sign in to see your policies, applications and saved documents.
      </p>

      <LoginForm />

      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-59px] left-[calc(50%+0.5px)] h-[266px] w-[407px] max-w-[calc(100%-32px)] -translate-x-1/2 overflow-hidden"
      >
        <Image
          src="/login/mascots.png"
          alt=""
          width={526}
          height={360}
          priority
          sizes="407px"
          className="absolute top-[-0.21%] left-0 h-[104.72%] w-full max-w-none"
        />
      </div>
    </main>
  );
}
