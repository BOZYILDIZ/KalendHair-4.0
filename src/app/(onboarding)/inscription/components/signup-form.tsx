"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { signupAction } from "../actions";
import type { SignupState } from "../actions";

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p className="mt-1 text-xs text-red-600" role="alert">
      {errors[0]}
    </p>
  );
}

export function SignupForm() {
  const [state, action, pending] = useActionState<SignupState, FormData>(
    signupAction,
    null,
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const fe = state?.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-5" noValidate>
      {/* Erreur globale */}
      {state?.error && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {state.error}
          {state.error.includes("connectez-vous") && (
            <Link
              href="/login"
              className="ml-1 font-medium underline underline-offset-2"
            >
              Se connecter
            </Link>
          )}
        </div>
      )}

      {/* Prénom + Nom */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label htmlFor="firstName" className="block text-sm font-medium text-slate-700">
            Prénom
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            autoComplete="given-name"
            aria-describedby={fe.firstName ? "firstName-error" : undefined}
            aria-invalid={!!fe.firstName}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 aria-invalid:border-red-400"
          />
          <div id="firstName-error">
            <FieldError errors={fe.firstName} />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="lastName" className="block text-sm font-medium text-slate-700">
            Nom
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            autoComplete="family-name"
            aria-describedby={fe.lastName ? "lastName-error" : undefined}
            aria-invalid={!!fe.lastName}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 aria-invalid:border-red-400"
          />
          <div id="lastName-error">
            <FieldError errors={fe.lastName} />
          </div>
        </div>
      </div>

      {/* Email */}
      <div className="space-y-1">
        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
          Adresse email professionnelle
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          aria-describedby={fe.email ? "email-error" : undefined}
          aria-invalid={!!fe.email}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 aria-invalid:border-red-400"
        />
        <div id="email-error">
          <FieldError errors={fe.email} />
        </div>
      </div>

      {/* Mot de passe */}
      <div className="space-y-1">
        <label htmlFor="password" className="block text-sm font-medium text-slate-700">
          Mot de passe
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            aria-describedby="password-requirements password-error"
            aria-invalid={!!fe.password}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-10 text-sm shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 aria-invalid:border-red-400"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600 focus:outline-none"
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            {showPassword ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        <p id="password-requirements" className="text-xs text-slate-500">
          12 caractères minimum · 1 majuscule · 1 minuscule · 1 chiffre · 1 caractère spécial
        </p>
        <div id="password-error">
          <FieldError errors={fe.password} />
        </div>
      </div>

      {/* Confirmation mot de passe */}
      <div className="space-y-1">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
          Confirmer le mot de passe
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirm ? "text" : "password"}
            autoComplete="new-password"
            aria-describedby={fe.confirmPassword ? "confirm-error" : undefined}
            aria-invalid={!!fe.confirmPassword}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-10 text-sm shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 aria-invalid:border-red-400"
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600 focus:outline-none"
            aria-label={showConfirm ? "Masquer" : "Afficher"}
          >
            {showConfirm ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        <div id="confirm-error">
          <FieldError errors={fe.confirmPassword} />
        </div>
      </div>

      {/* Acceptation CGU */}
      <div className="space-y-3 rounded-lg bg-slate-50 p-4">
        <div className="flex items-start gap-3">
          <input
            id="acceptCGU"
            name="acceptCGU"
            type="checkbox"
            value="on"
            aria-describedby={fe.acceptCGU ? "cgu-error" : undefined}
            aria-invalid={!!fe.acceptCGU}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="acceptCGU" className="text-sm text-slate-600">
            J&apos;accepte les{" "}
            <Link
              href="/conditions-utilisation"
              target="_blank"
              className="font-medium text-indigo-600 underline underline-offset-2 hover:text-indigo-800"
            >
              conditions d&apos;utilisation
            </Link>
          </label>
        </div>
        <div id="cgu-error">
          <FieldError errors={fe.acceptCGU} />
        </div>

        <div className="flex items-start gap-3">
          <input
            id="acceptPrivacy"
            name="acceptPrivacy"
            type="checkbox"
            value="on"
            aria-describedby={fe.acceptPrivacy ? "privacy-error" : undefined}
            aria-invalid={!!fe.acceptPrivacy}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="acceptPrivacy" className="text-sm text-slate-600">
            J&apos;accepte la{" "}
            <Link
              href="/confidentialite"
              target="_blank"
              className="font-medium text-indigo-600 underline underline-offset-2 hover:text-indigo-800"
            >
              politique de confidentialité
            </Link>
          </label>
        </div>
        <div id="privacy-error">
          <FieldError errors={fe.acceptPrivacy} />
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Création du compte…" : "Créer mon compte gratuit"}
      </button>

      {/* Lien connexion */}
      <p className="text-center text-sm text-slate-500">
        Déjà un compte ?{" "}
        <Link
          href="/login"
          className="font-medium text-indigo-600 hover:text-indigo-800"
        >
          Se connecter
        </Link>
      </p>
    </form>
  );
}
