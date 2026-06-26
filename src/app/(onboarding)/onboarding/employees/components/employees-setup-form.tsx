"use client";

import { useActionState, useMemo, useState } from "react";
import { updateEmployeesSetupAction } from "../actions";
import type { EmployeesSetupState } from "@/lib/schemas/employees-setup.schema";
import type { EmployeeInit, ServiceOption } from "../page";

// ── Types internes ────────────────────────────────────────────────────────────

interface EmployeeDraft {
  key: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  color: string;
  useColor: boolean;
  isActive: boolean;
  serviceIds: string[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeKey(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

// ── Composant ────────────────────────────────────────────────────────────────

interface Props {
  existingEmployees: EmployeeInit[];
  serviceOptions: ServiceOption[];
}

export function EmployeesSetupForm({ existingEmployees, serviceOptions }: Props) {
  const [state, formAction, isPending] = useActionState<
    EmployeesSetupState,
    FormData
  >(updateEmployeesSetupAction, null);

  const [employees, setEmployees] = useState<EmployeeDraft[]>(() =>
    existingEmployees.map((e) => ({
      key: e.key,
      firstName: e.firstName,
      lastName: e.lastName,
      email: e.email,
      phone: e.phone,
      color: e.color || "#6366f1",
      useColor: !!e.color,
      isActive: e.isActive,
      serviceIds: e.serviceIds,
    })),
  );

  // ── Payload JSON sérialisé ────────────────────────────────────────────────
  const payload = useMemo(
    () =>
      JSON.stringify({
        employees: employees.map((emp) => ({
          key: emp.key,
          firstName: emp.firstName,
          lastName: emp.lastName,
          email: emp.email,
          phone: emp.phone,
          color: emp.useColor ? emp.color : "",
          isActive: emp.isActive,
          serviceIds: emp.serviceIds,
        })),
      }),
    [employees],
  );

  // ── Mutations employés ────────────────────────────────────────────────────
  const addEmployee = () => {
    setEmployees((prev) => [
      ...prev,
      {
        key: makeKey("emp"),
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        color: "#6366f1",
        useColor: false,
        isActive: true,
        serviceIds: [],
      },
    ]);
  };

  const updateEmployee = (key: string, updates: Partial<EmployeeDraft>) => {
    setEmployees((prev) =>
      prev.map((e) => (e.key === key ? { ...e, ...updates } : e)),
    );
  };

  const deleteEmployee = (key: string) => {
    setEmployees((prev) => prev.filter((e) => e.key !== key));
  };

  const moveEmployee = (key: string, direction: "up" | "down") => {
    setEmployees((prev) => {
      const idx = prev.findIndex((e) => e.key === key);
      if (idx === -1) return prev;
      const newIdx = direction === "up" ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const result = [...prev];
      const tmp = result[idx]!;
      result[idx] = result[newIdx]!;
      result[newIdx] = tmp;
      return result;
    });
  };

  const toggleService = (empKey: string, serviceId: string) => {
    setEmployees((prev) =>
      prev.map((e) => {
        if (e.key !== empKey) return e;
        const has = e.serviceIds.includes(serviceId);
        return {
          ...e,
          serviceIds: has
            ? e.serviceIds.filter((id) => id !== serviceId)
            : [...e.serviceIds, serviceId],
        };
      }),
    );
  };

  const selectAllServices = (empKey: string) => {
    const allIds = serviceOptions.map((s) => s.id);
    setEmployees((prev) =>
      prev.map((e) => (e.key === empKey ? { ...e, serviceIds: allIds } : e)),
    );
  };

  const clearAllServices = (empKey: string) => {
    setEmployees((prev) =>
      prev.map((e) => (e.key === empKey ? { ...e, serviceIds: [] } : e)),
    );
  };

  return (
    <form action={formAction} noValidate>
      <input type="hidden" name="payload" value={payload} />

      {/* ── Message d'erreur global ────────────────────────────────────── */}
      {state?.error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="whitespace-pre-line text-sm font-medium text-red-700">
            {state.error}
          </p>
        </div>
      )}

      {/* ── En-tête section ────────────────────────────────────────────── */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Membres de l&apos;équipe</h2>
          <p className="text-xs text-slate-500">Au moins un employé est requis.</p>
        </div>
        <button
          type="button"
          onClick={addEmployee}
          disabled={employees.length >= 20}
          className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          + Ajouter un employé
        </button>
      </div>

      {/* ── Liste des employés ─────────────────────────────────────────── */}
      {employees.length === 0 ? (
        <p className="mb-8 rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
          Aucun employé — cliquez sur « Ajouter un employé » pour commencer.
        </p>
      ) : (
        <ul className="mb-8 space-y-6">
          {employees.map((emp, idx) => (
            <li
              key={emp.key}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              {/* Ligne 1 : Prénom + Nom + Actif */}
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  value={emp.firstName}
                  onChange={(e) =>
                    updateEmployee(emp.key, { firstName: e.target.value })
                  }
                  placeholder="Prénom"
                  maxLength={50}
                  className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                />
                <input
                  type="text"
                  value={emp.lastName}
                  onChange={(e) =>
                    updateEmployee(emp.key, { lastName: e.target.value })
                  }
                  placeholder="Nom"
                  maxLength={50}
                  className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                />

                {/* Toggle actif */}
                <label className="flex cursor-pointer items-center gap-1.5 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={emp.isActive}
                    onChange={(e) =>
                      updateEmployee(emp.key, { isActive: e.target.checked })
                    }
                    className="sr-only"
                  />
                  <span
                    className={`relative inline-block h-5 w-9 rounded-full transition ${
                      emp.isActive ? "bg-indigo-500" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                        emp.isActive ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </span>
                  Actif
                </label>
              </div>

              {/* Ligne 2 : Email + Téléphone */}
              <div className="mb-3 flex flex-wrap gap-3">
                <input
                  type="email"
                  value={emp.email}
                  onChange={(e) =>
                    updateEmployee(emp.key, { email: e.target.value })
                  }
                  placeholder="Email (optionnel)"
                  maxLength={100}
                  className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                />
                <input
                  type="tel"
                  value={emp.phone}
                  onChange={(e) =>
                    updateEmployee(emp.key, { phone: e.target.value })
                  }
                  placeholder="Téléphone (optionnel)"
                  maxLength={20}
                  className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                />
              </div>

              {/* Ligne 3 : Couleur calendrier */}
              <div className="mb-4 flex items-center gap-3">
                <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={emp.useColor}
                    onChange={(e) =>
                      updateEmployee(emp.key, { useColor: e.target.checked })
                    }
                    className="rounded border-slate-300 text-indigo-500 focus:ring-indigo-400"
                  />
                  Couleur agenda
                </label>
                {emp.useColor && (
                  <input
                    type="color"
                    value={emp.color}
                    onChange={(e) =>
                      updateEmployee(emp.key, { color: e.target.value })
                    }
                    className="h-8 w-12 cursor-pointer rounded border border-slate-200 p-0.5"
                    title="Couleur dans l'agenda"
                  />
                )}
                {emp.useColor && (
                  <span className="text-xs text-slate-400">{emp.color}</span>
                )}
              </div>

              {/* Section Services */}
              {serviceOptions.length > 0 && (
                <div className="mb-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-700">
                      Services réalisés{" "}
                      <span className="font-normal text-slate-400">
                        ({emp.serviceIds.length} sélectionné
                        {emp.serviceIds.length !== 1 ? "s" : ""})
                      </span>
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => selectAllServices(emp.key)}
                        className="text-xs text-indigo-600 underline-offset-2 hover:underline"
                      >
                        Tout sélectionner
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={() => clearAllServices(emp.key)}
                        className="text-xs text-slate-500 underline-offset-2 hover:underline"
                      >
                        Tout effacer
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {serviceOptions.map((svc) => {
                      const checked = emp.serviceIds.includes(svc.id);
                      return (
                        <label
                          key={svc.id}
                          className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs transition ${
                            checked
                              ? "border-indigo-200 bg-indigo-50 text-indigo-800"
                              : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleService(emp.key, svc.id)}
                            className="shrink-0 rounded border-slate-300 text-indigo-500 focus:ring-indigo-400"
                          />
                          <span className="min-w-0 truncate">
                            {svc.categoryName ? (
                              <span className="text-slate-400">
                                {svc.categoryName} ·{" "}
                              </span>
                            ) : null}
                            {svc.name}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Actions : réordonner + supprimer */}
              <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => moveEmployee(emp.key, "up")}
                  disabled={idx === 0}
                  className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-500 transition hover:border-slate-300 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
                  title="Monter"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveEmployee(emp.key, "down")}
                  disabled={idx === employees.length - 1}
                  className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-500 transition hover:border-slate-300 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
                  title="Descendre"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => deleteEmployee(emp.key)}
                  className="ml-auto text-xs text-slate-400 transition hover:text-red-500"
                  title="Supprimer cet employé"
                >
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* ── Navigation ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-2">
        <a
          href="/onboarding/services"
          className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
        >
          ← Précédent
        </a>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? "Enregistrement…" : "Continuer →"}
        </button>
      </div>
    </form>
  );
}
