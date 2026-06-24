"use client";

import { useState, useActionState } from "react";
import type { AdminActionState, OrgAdminNote } from "@/features/admin/types";

type NoteAction = (
  prev: AdminActionState,
  formData: FormData,
) => Promise<AdminActionState>;

const initState: AdminActionState = {};

export function NoteItem({
  note,
  orgId,
  updateAction,
  deleteAction,
}: {
  note: OrgAdminNote;
  orgId: string;
  updateAction: NoteAction;
  deleteAction: NoteAction;
}) {
  const [mode, setMode] = useState<"view" | "edit" | "delete">("view");
  const [editState, editFormAction, editPending] = useActionState(
    updateAction,
    initState,
  );
  const [deleteState, deleteFormAction, deletePending] = useActionState(
    deleteAction,
    initState,
  );

  const createdAt =
    note.createdAt instanceof Date
      ? note.createdAt
      : new Date(note.createdAt);

  return (
    <div className="rounded border border-gray-200 p-3 space-y-2">
      {mode === "view" && (
        <>
          <p className="text-sm text-gray-800">{note.content}</p>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">
              {note.adminName} —{" "}
              {createdAt.toLocaleDateString("fr-FR")}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setMode("edit")}
                className="text-xs text-blue-600 hover:underline"
              >
                Modifier
              </button>
              <button
                type="button"
                onClick={() => setMode("delete")}
                className="text-xs text-red-600 hover:underline"
              >
                Supprimer
              </button>
            </div>
          </div>
        </>
      )}

      {mode === "edit" && (
        <form action={editFormAction} className="space-y-2">
          <input type="hidden" name="orgId" value={orgId} />
          <input type="hidden" name="noteId" value={note.id} />
          {editState.error && (
            <p className="rounded bg-red-50 p-2 text-xs text-red-700">
              {editState.error}
            </p>
          )}
          <textarea
            name="content"
            defaultValue={note.content}
            rows={3}
            required
            className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={editPending}
              className="rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {editPending ? "Sauvegarde..." : "Sauvegarder"}
            </button>
            <button
              type="button"
              onClick={() => setMode("view")}
              className="rounded bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {mode === "delete" && (
        <form action={deleteFormAction} className="space-y-2">
          <input type="hidden" name="orgId" value={orgId} />
          <input type="hidden" name="noteId" value={note.id} />
          {deleteState.error && (
            <p className="rounded bg-red-50 p-2 text-xs text-red-700">
              {deleteState.error}
            </p>
          )}
          <p className="text-sm text-gray-700">
            Supprimer cette note ? Cette action est irréversible.
          </p>
          <div>
            <label className="block text-xs font-medium text-gray-700">
              Raison de la suppression (min. 10 caractères)
            </label>
            <input
              name="reason"
              type="text"
              required
              minLength={10}
              className="mt-1 w-full rounded border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Ex: Note incorrecte, information obsolète."
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={deletePending}
              className="rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {deletePending ? "Suppression..." : "Confirmer la suppression"}
            </button>
            <button
              type="button"
              onClick={() => setMode("view")}
              className="rounded bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200"
            >
              Annuler
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
