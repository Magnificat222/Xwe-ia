"use client";

import { Suspense } from "react";
import { AuthSlider } from "@/components/shared/auth-slider";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <AuthSlider initialMode="login" />
    </Suspense>
  );
}
