"use client";

import { Suspense } from "react";
import { AuthSlider } from "@/components/shared/auth-slider";

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <AuthSlider initialMode="register" />
    </Suspense>
  );
}
