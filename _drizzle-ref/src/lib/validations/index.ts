import { z } from "zod";

export const emailSchema = z
  .string()
  .min(1, "L'e-mail est requis")
  .email("Adresse e-mail invalide")
  .transform((v) => v.trim().toLowerCase());

export const passwordSchema = z
  .string()
  .min(8, "8 caractères minimum")
  .max(128, "Mot de passe trop long");

export const registerSchema = z.object({
  name: z.string().min(2, "Indique ton nom").max(80),
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Le mot de passe est requis"),
});

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z
  .object({
    token: z.string().min(10),
    password: passwordSchema,
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirm"],
  });

export const onboardingSchema = z.object({
  displayName: z.string().min(2, "Indique un nom d'affichage").max(60),
  domain: z.string().max(80).optional().default(""),
  level: z.enum(["debutant", "intermediaire", "avance"]).default("debutant"),
  goalIds: z.array(z.string()).default([]),
  interests: z.array(z.string()).default([]),
});

export const profileSchema = z.object({
  displayName: z.string().min(2).max(60),
  bio: z.string().max(400).optional().default(""),
  domain: z.string().max(80).optional().default(""),
  country: z.string().max(64).optional().default(""),
});

export const changePasswordSchema = z
  .object({
    current: z.string().min(1, "Mot de passe actuel requis"),
    password: passwordSchema,
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirm"],
  });

export const discussionSchema = z.object({
  title: z.string().min(6, "Titre trop court").max(200),
  body: z.string().min(10, "Développe un peu ton message").max(6000),
  categoryId: z.string().optional(),
});

export const replySchema = z.object({
  discussionId: z.string().min(1),
  body: z.string().min(2, "Message vide").max(4000),
});

export const supportSchema = z.object({
  subject: z.string().min(4, "Sujet trop court").max(200),
  message: z.string().min(10, "Décris ta demande").max(4000),
  email: emailSchema.optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
