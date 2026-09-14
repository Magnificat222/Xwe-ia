import type { Transition, Variants } from "framer-motion";

/**
 * Vocabulaire d'animation partagé — une seule source de vérité pour que
 * toute l'application bouge de la même façon.
 *
 * Les composants de src/components/motion neutralisent automatiquement ces
 * variantes quand l'utilisateur a demandé une réduction des animations.
 */

/** Courbes de Bézier maison : sortie franche puis atterrissage doux. */
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

export const springSoft: Transition = { type: "spring", stiffness: 240, damping: 28, mass: 0.8 };
export const springSnappy: Transition = { type: "spring", stiffness: 420, damping: 32 };

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_OUT } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: EASE_OUT } },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: EASE_OUT } },
};

export const staggerContainer = (stagger = 0.08, delay = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

/** Transition entre deux missions : la sortante part, l'entrante arrive. */
export const missionTransition: Variants = {
  enter: (direction: number) => ({ opacity: 0, x: direction > 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.35, ease: EASE_OUT } },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -40 : 40,
    transition: { duration: 0.25, ease: EASE_IN_OUT },
  }),
};

export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE_OUT } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

/** Micro-interaction standard des éléments cliquables. */
export const tapScale = { scale: 0.97 };
export const hoverLift = { y: -4, transition: { duration: 0.25, ease: EASE_OUT } };
