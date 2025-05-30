"use client";
import { useAuthInit } from "@/hooks/useAuthInit";

/**
 * Client component to initialize authentication state
 * Should be placed early in the component tree
 */
export default function AuthInitializer() {
  useAuthInit();

  return null; // This component doesn't render anything
}
