import { z } from "zod";

export const SignupFormSchema = z
  .object({
    firstName: z
      .string()
      .min(1, "Le prénom est requis")
      .max(50, "50 caractères maximum")
      .trim(),
    lastName: z
      .string()
      .min(1, "Le nom est requis")
      .max(50, "50 caractères maximum")
      .trim(),
    email: z
      .string()
      .email("Adresse email invalide")
      .toLowerCase()
      .trim(),
    password: z
      .string()
      .min(12, "Minimum 12 caractères")
      .regex(/[A-Z]/, "Au moins une lettre majuscule requise")
      .regex(/[a-z]/, "Au moins une lettre minuscule requise")
      .regex(/[0-9]/, "Au moins un chiffre requis")
      .regex(
        /[^A-Za-z0-9]/,
        "Au moins un caractère spécial requis (ex : @, !, #, $)",
      ),
    confirmPassword: z.string().min(1, "La confirmation est requise"),
    acceptCGU: z.enum(["on"], {
      message: "Vous devez accepter les conditions d'utilisation",
    }),
    acceptPrivacy: z.enum(["on"], {
      message: "Vous devez accepter la politique de confidentialité",
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export type SignupFormData = z.infer<typeof SignupFormSchema>;
