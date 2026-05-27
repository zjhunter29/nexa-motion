"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useNexaStore } from "@/lib/store";

export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const onboarded = useNexaStore((s) => s.profile.onboarded);
  const hydrated = useNexaStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) return;
    if (!onboarded && !pathname?.startsWith("/onboarding")) {
      router.replace("/onboarding");
    }
    if (onboarded && pathname?.startsWith("/onboarding")) {
      router.replace("/");
    }
  }, [hydrated, onboarded, pathname, router]);

  return <>{children}</>;
}
