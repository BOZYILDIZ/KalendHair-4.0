"use client";

import { useActionState } from "react";
import {
  DAYS_OF_WEEK,
  DAY_LABELS,
  type SalonScheduleGridEntry,
  type ScheduleFormState,
} from "../types";
import { minutesToTime } from "@/lib/utils/time";

type Props = {
  schedule: SalonScheduleGridEntry[];
  action: (prevState: ScheduleFormState, formData: FormData) => Promise<ScheduleFormState>;
};

export function SalonScheduleForm({ schedule, action }: Props) {
  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-4">
      {state?.success && (
        <p className="rounded bg-green-50 px-4 py-2 text-sm text-green-700">
          {state.message}
        </p>
      )}
      {state && !state.success && state.message && (
        <p className="rounded bg-red-50 px-4 py-2 text-sm text-red-700">
          {state.message}
        </p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-600">
              <th className="pb-2 pr-4 font-medium">Jour</th>
              <th className="pb-2 pr-4 font-medium">Ouvert</th>
              <th className="pb-2 pr-4 font-medium">Début</th>
              <th className="pb-2 font-medium">Fin</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {DAYS_OF_WEEK.map((day) => {
              const entry = schedule.find((s) => s.dayOfWeek === day);
              const startVal = minutesToTime(entry?.startMinute ?? 540);
              const endVal   = minutesToTime(entry?.endMinute ?? 1080);
              const isOpen   = entry?.isOpen ?? false;
              const err      = state?.errors?.[day]?.[0];
              return (
                <tr key={day} className="py-2">
                  <td className="py-2 pr-4 font-medium text-gray-700">
                    {DAY_LABELS[day]}
                  </td>
                  <td className="py-2 pr-4">
                    <input
                      type="checkbox"
                      name={`${day}_isOpen`}
                      defaultChecked={isOpen}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </td>
                  <td className="py-2 pr-4">
                    <input
                      type="time"
                      name={`${day}_start`}
                      defaultValue={startVal}
                      className="rounded border px-2 py-1 text-sm"
                    />
                  </td>
                  <td className="py-2">
                    <input
                      type="time"
                      name={`${day}_end`}
                      defaultValue={endVal}
                      className="rounded border px-2 py-1 text-sm"
                    />
                    {err && (
                      <p className="mt-1 text-xs text-red-600">{err}</p>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? "Enregistrement…" : "Enregistrer les horaires"}
      </button>
    </form>
  );
}
