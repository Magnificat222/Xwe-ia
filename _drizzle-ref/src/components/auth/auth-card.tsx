"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Lisere } from "@/components/ui/misc";

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md"
    >
      <div className="overflow-hidden rounded-panel border border-ivoire/10 bg-noir-elevated shadow-[0_24px_60px_-30px_rgba(0,0,0,0.9)]">
        <Lisere />
        <div className="p-7 sm:p-8">
          <h1 className="font-display text-2xl text-ivoire">{title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-ivoire-dim">{subtitle}</p>
          <div className="mt-7">{children}</div>
        </div>
      </div>
      {footer && <div className="mt-6 text-center text-sm text-ivoire-dim">{footer}</div>}
    </motion.div>
  );
}
