"use client";

import { useRouter as useNextRouter } from "next/navigation";
import { useNavigation } from "@/providers/NavigationProvider";

export function useRouter() {
  const router = useNextRouter();
  const { startLoading } = useNavigation();

  const push = (href: string, options?: { scroll?: boolean }) => {
    startLoading();
    router.push(href, options);
  };

  const replace = (href: string, options?: { scroll?: boolean }) => {
    startLoading();
    router.replace(href, options);
  };

  const back = () => {
    startLoading();
    router.back();
  };

  const forward = () => {
    startLoading();
    router.forward();
  };

  const refresh = () => {
    startLoading();
    router.refresh();
  };

  return {
    push,
    replace,
    back,
    forward,
    refresh,
    // Include other router methods without modification
    prefetch: router.prefetch,
  };
}
