"use client";

import Link from "next/link";
import { useState } from "react";
import type { OrgListItem } from "@/features/admin/types";
import { OrgStatusBadge } from "./org-status-badge";

export function OrgTable({ orgs }: { orgs: OrgListItem[] }) {
  const [filter, setFilter] = useState<"all" | "active" | "suspended">("all");
  const [search, setSearch] = useState("");

  const filtered = orgs.filter((o) => {
    const matchStatus =
      filter === "all" ||
      (filter === "active" && o.isActive) ||
      (filter === "suspended" && !o.isActive);
    const matchSearch =
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      (o.ownerEmail ?? "").toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex gap-2">
          {(["all", "active", "suspended"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === f
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f === "all" ? "Toutes" : f === "active" ? "Actives" : "Suspendues"}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-400">
          {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Organisation</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Créée le</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((org) => (
              <tr key={org.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <OrgStatusBadge isActive={org.isActive} />
                </td>
                <td className="px-4 py-3 font-medium">{org.name}</td>
                <td className="px-4 py-3 text-gray-500">
                  {org.ownerEmail ?? "–"}
                </td>
                <td className="px-4 py-3">
                  {org.planCode ? (
                    <span className="font-medium">{org.planCode}</span>
                  ) : (
                    <span className="text-gray-400">–</span>
                  )}
                  {org.isFree && (
                    <span className="ml-1 rounded bg-emerald-100 px-1 py-0.5 text-xs text-emerald-700">
                      Gratuit
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {org.createdAt.toLocaleDateString("fr-FR")}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/organizations/${org.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Voir
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  Aucun résultat.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
