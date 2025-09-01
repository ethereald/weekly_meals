"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        router.replace("/meals/weekly");
      } else {
        router.replace("/login");
      }
    }
  }, [router]);
  return null;
}
