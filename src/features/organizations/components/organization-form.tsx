"use client";

import { useActionState } from "react";
import type { OrganizationView, OrganizationFormState } from "../types";

type Props = {
  organization: OrganizationView;
  action: (
    prevState: OrganizationFormState,
    formData: FormData,
  ) => Promise<OrganizationFormState>;
};

export function OrganizationForm({ organization, action }: Props) {
  const [state, formAction, pending] = useActionState<
    OrganizationFormState,
    FormData
  >(action, null);

  return (
    <div className="space-y-6">
      {state?.success && (
        <p className="rounded bg-green-50 px-3 py-2 text-sm text-green-700">
          Organisation mise à jour.
        </p>
      )}
      {state?.message && !state.success && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </p>
      )}

      <form action={formAction} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="name" className="block text-sm font-medium">
            Nom de l&apos;organisation
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={organization.name}
            className="w-full rounded border px-3 py-2 text-sm"
          />
          {state?.errors?.name && (
            <p className="text-xs text-red-600">{state.errors.name[0]}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="rounded bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? "Enregistrement…" : "Enregistrer"}
        </button>
      </form>

      <div className="border-t pt-4 text-sm text-gray-500">
        <p>
          <span className="font-medium">Slug :</span>{" "}
          <span className="font-mono">{organization.slug}</span>
        </p>
        <p>
          <span className="font-medium">Créé le :</span>{" "}
          {organization.createdAt.toLocaleDateString("fr-FR")}
        </p>
      </div>
    </div>
  );
}
