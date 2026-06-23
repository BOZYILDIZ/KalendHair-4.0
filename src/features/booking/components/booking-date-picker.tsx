"use client";

import { useRouter } from "next/navigation";

type Props = {
  salonSlug: string;
  serviceId: string;
  employeeId: string;
};

export function BookingDatePicker({ salonSlug, serviceId, employeeId }: Props) {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0] ?? "";

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.value) {
      router.push(`/book/${salonSlug}?serviceId=${serviceId}&employeeId=${employeeId}&date=${e.target.value}`);
    }
  }

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Choisissez une date</h2>
      <input
        type="date"
        min={today}
        onChange={handleChange}
        className="rounded border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
      />
      <p className="mt-2 text-xs text-gray-400">Les dates passées ne sont pas disponibles à la réservation.</p>
    </div>
  );
}
