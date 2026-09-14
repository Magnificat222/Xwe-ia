"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";

const DISPLAY_DURATION_MS = 3200;

export function IntroSplash() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Show the splash once per browser session, not on every navigation.
    const alreadySeen = sessionStorage.getItem("xwe-ia-intro-seen");
    if (alreadySeen) {
      setVisible(false);
      return;
    }

    const timer = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem("xwe-ia-intro-seen", "1");
    }, DISPLAY_DURATION_MS);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-noir"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <div style={{ perspective: 1000 }}>
            <motion.div
              style={{ transformStyle: "preserve-3d" }}
              animate={{ rotateY: 360 }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "linear" }}
              className="relative h-40 w-40 md:h-48 md:w-48"
            >
              <Image
                src="/logo-xwe-ia.png"
                alt="Xwé IA"
                fill
                priority
                className="object-contain"
              />
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="mt-8 font-display text-2xl text-ivoire md:text-3xl"
          >
            Bienvenue à <span className="text-or">Xwé IA</span>
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
