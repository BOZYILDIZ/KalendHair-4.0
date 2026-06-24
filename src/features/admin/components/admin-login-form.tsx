"use client";

import { useActionState } from "react";
import { adminLoginAction } from "@/app/(admin)/admin/login/actions";
import type { AdminActionState } from "@/features/admin/types";

const initialState: AdminActionState = {};

export function AdminLoginForm() {
  const [state, action, pending] = useActionState(adminLoginAction, initialState);

  return (
    <form action={action} className="space-y-4">
      {state.error && (
        <p className="rounded bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </p>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          name="email"
          required
          className="mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          placeholder="admin@kalend.dev"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Mot de passe
        </label>
        <input
          type="password"
          name="password"
          required
          className="mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {pending ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  );
}
