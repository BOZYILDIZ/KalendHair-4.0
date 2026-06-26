"use client";

import { useActionState, useMemo, useState } from "react";
import { updateServicesSetupAction } from "../actions";
import type { ServicesSetupState } from "@/lib/schemas/services-setup.schema";
import type { CategoryInit, ServiceInit } from "../page";

// ── Types internes ────────────────────────────────────────────────────────────

interface CategoryDraft {
  key: string;
  name: string;
}

interface ServiceDraft {
  key: string;
  name: string;
  categoryKey: string;
  durationStr: string;
  priceStr: string;
  color: string;
  useColor: boolean;
  description: string;
  isActive: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeKey(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

// ── Composant ────────────────────────────────────────────────────────────────

interface Props {
  existingCategories: CategoryInit[];
  existingServices: ServiceInit[];
}

export function ServicesSetupForm({
  existingCategories,
  existingServices,
}: Props) {
  const [state, formAction, isPending] = useActionState<
    ServicesSetupState,
    FormData
  >(updateServicesSetupAction, null);

  // ── État des catégories ───────────────────────────────────────────────────
  const [categories, setCategories] = useState<CategoryDraft[]>(() =>
    existingCategories.map((c) => ({ key: c.key, name: c.name })),
  );

  // ── État des services ─────────────────────────────────────────────────────
  const [services, setServices] = useState<ServiceDraft[]>(() =>
    existingServices.map((s) => ({
      key: s.key,
      name: s.name,
      categoryKey: s.categoryKey,
      durationStr: s.durationMinutes.toString(),
      priceStr: (s.priceEuros).toFixed(2),
      color: s.color || "#6366f1",
      useColor: !!s.color,
      description: s.description,
      isActive: s.isActive,
    })),
  );

  // ── Payload JSON sérialisé ────────────────────────────────────────────────
  const payload = useMemo(
    () =>
      JSON.stringify({
        categories: categories.map(({ key, name }) => ({ key, name })),
        services: services.map((svc) => ({
          key: svc.key,
          name: svc.name,
          categoryKey: svc.categoryKey,
          durationMinutes: parseInt(svc.durationStr, 10) || 0,
          priceEuros: parseFloat(svc.priceStr) || 0,
          color: svc.useColor ? svc.color : "",
          description: svc.description,
          isActive: svc.isActive,
        })),
      }),
    [categories, services],
  );

  // ── Mutations catégories ──────────────────────────────────────────────────
  const addCategory = () => {
    setCategories((prev) => [...prev, { key: makeKey("cat"), name: "" }]);
  };

  const updateCategory = (key: string, name: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.key === key ? { ...c, name } : c)),
    );
  };

  const deleteCategory = (key: string) => {
    setCategories((prev) => prev.filter((c) => c.key !== key));
    setServices((prev) =>
      prev.map((s) => (s.categoryKey === key ? { ...s, categoryKey: "" } : s)),
    );
  };

  // ── Mutations services ────────────────────────────────────────────────────
  const addService = () => {
    setServices((prev) => [
      ...prev,
      {
        key: makeKey("svc"),
        name: "",
        categoryKey: categories[0]?.key ?? "",
        durationStr: "30",
        priceStr: "0.00",
        color: "#6366f1",
        useColor: false,
        description: "",
        isActive: true,
      },
    ]);
  };

  const updateService = (key: string, updates: Partial<ServiceDraft>) => {
    setServices((prev) =>
      prev.map((s) => (s.key === key ? { ...s, ...updates } : s)),
    );
  };

  const deleteService = (key: string) => {
    setServices((prev) => prev.filter((s) => s.key !== key));
  };

  const moveService = (key: string, direction: "up" | "down") => {
    setServices((prev) => {
      const idx = prev.findIndex((s) => s.key === key);
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

      {/* ── Section Catégories ─────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Catégories
            </h2>
            <p className="text-xs text-slate-500">
              Optionnel — regroupez vos services par type.
            </p>
          </div>
          <button
            type="button"
            onClick={addCategory}
            disabled={categories.length >= 20}
            className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            + Ajouter
          </button>
        </div>

        {categories.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 p-4 text-center text-sm text-slate-400">
            Aucune catégorie — cliquez sur « Ajouter » pour en créer une.
          </p>
        ) : (
          <ul className="space-y-2">
            {categories.map((cat) => (
              <li
                key={cat.key}
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2"
              >
                <span className="text-slate-400">☰</span>
                <input
                  type="text"
                  value={cat.name}
                  onChange={(e) => updateCategory(cat.key, e.target.value)}
                  placeholder="Nom de la catégorie (ex : Coupe, Coloration…)"
                  maxLength={50}
                  className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => deleteCategory(cat.key)}
                  className="shrink-0 text-slate-400 transition hover:text-red-500"
                  title="Supprimer la catégorie"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Section Services ───────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Services</h2>
            <p className="text-xs text-slate-500">
              Au moins un service est requis.
            </p>
          </div>
          <button
            type="button"
            onClick={addService}
            disabled={services.length >= 50}
            className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            + Ajouter un service
          </button>
        </div>

        {services.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 p-4 text-center text-sm text-slate-400">
            Aucun service — cliquez sur « Ajouter un service » pour commencer.
          </p>
        ) : (
          <ul className="space-y-4">
            {services.map((svc, idx) => (
              <li
                key={svc.key}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                {/* Ligne 1 : Nom + Catégorie + Actif */}
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <input
                    type="text"
                    value={svc.name}
                    onChange={(e) =>
                      updateService(svc.key, { name: e.target.value })
                    }
                    placeholder="Nom du service (ex : Coupe homme)"
                    maxLength={100}
                    className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  />

                  {categories.length > 0 && (
                    <select
                      value={svc.categoryKey}
                      onChange={(e) =>
                        updateService(svc.key, { categoryKey: e.target.value })
                      }
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                    >
                      <option value="">— Catégorie —</option>
                      {categories.map((cat) => (
                        <option key={cat.key} value={cat.key}>
                          {cat.name || "(sans nom)"}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Toggle actif */}
                  <label className="flex cursor-pointer items-center gap-1.5 text-xs text-slate-600">
                    <input
                      type="checkbox"
                      checked={svc.isActive}
                      onChange={(e) =>
                        updateService(svc.key, { isActive: e.target.checked })
                      }
                      className="sr-only"
                    />
                    <span
                      className={`relative inline-block h-5 w-9 rounded-full transition ${
                        svc.isActive ? "bg-indigo-500" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                          svc.isActive ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </span>
                    Actif
                  </label>
                </div>

                {/* Ligne 2 : Durée + Prix + Couleur */}
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-1.5 text-sm text-slate-700">
                    <span className="text-xs text-slate-500">Durée</span>
                    <input
                      type="number"
                      value={svc.durationStr}
                      onChange={(e) =>
                        updateService(svc.key, { durationStr: e.target.value })
                      }
                      min={5}
                      max={480}
                      step={5}
                      className="w-20 rounded-lg border border-slate-200 px-2 py-1.5 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                    />
                    <span className="text-xs text-slate-500">min</span>
                  </label>

                  <label className="flex items-center gap-1.5 text-sm text-slate-700">
                    <span className="text-xs text-slate-500">Prix</span>
                    <input
                      type="number"
                      value={svc.priceStr}
                      onChange={(e) =>
                        updateService(svc.key, { priceStr: e.target.value })
                      }
                      min={0}
                      max={10000}
                      step={0.01}
                      className="w-24 rounded-lg border border-slate-200 px-2 py-1.5 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                    />
                    <span className="text-xs text-slate-500">€</span>
                  </label>

                  {/* Couleur optionnelle */}
                  <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-600">
                    <input
                      type="checkbox"
                      checked={svc.useColor}
                      onChange={(e) =>
                        updateService(svc.key, { useColor: e.target.checked })
                      }
                      className="rounded border-slate-300 text-indigo-500 focus:ring-indigo-400"
                    />
                    Couleur
                  </label>
                  {svc.useColor && (
                    <input
                      type="color"
                      value={svc.color}
                      onChange={(e) =>
                        updateService(svc.key, { color: e.target.value })
                      }
                      className="h-8 w-12 cursor-pointer rounded border border-slate-200 p-0.5"
                      title="Choisir une couleur"
                    />
                  )}
                </div>

                {/* Ligne 3 : Description */}
                <div className="mb-3">
                  <textarea
                    value={svc.description}
                    onChange={(e) =>
                      updateService(svc.key, { description: e.target.value })
                    }
                    placeholder="Description (optionnel)"
                    maxLength={500}
                    rows={2}
                    className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  />
                </div>

                {/* Actions : réordonner + supprimer */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => moveService(svc.key, "up")}
                    disabled={idx === 0}
                    className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-500 transition hover:border-slate-300 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
                    title="Monter"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveService(svc.key, "down")}
                    disabled={idx === services.length - 1}
                    className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-500 transition hover:border-slate-300 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
                    title="Descendre"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteService(svc.key)}
                    className="ml-auto text-xs text-slate-400 transition hover:text-red-500"
                    title="Supprimer le service"
                  >
                    Supprimer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Navigation ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-2">
        <a
          href="/onboarding/salon"
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
