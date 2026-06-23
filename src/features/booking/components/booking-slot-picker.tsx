import Link from "next/link";
import { minutesToTime } from "@/lib/utils/time";

type Props = {
  slots: number[];
  salonSlug: string;
  serviceId: string;
  employeeId: string;
  date: string;
};

export function BookingSlotPicker({ slots, salonSlug, serviceId, employeeId, date }: Props) {
  const parts = date.split("-");
  const displayDate = `${parts[2] ?? ""}/${parts[1] ?? ""}/${parts[0] ?? ""}`;

  if (slots.length === 0) {
    return (
      <div className="mt-6">
        <p className="text-gray-500">Aucun créneau disponible pour le {displayDate}.</p>
        <Link href={`/book/${salonSlug}?serviceId=${serviceId}&employeeId=${employeeId}`} className="mt-2 inline-block text-sm text-indigo-600 hover:underline">← Choisir une autre date</Link>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Créneaux disponibles — {displayDate}</h2>
      <div className="flex flex-wrap gap-2">
        {slots.map((slot) => (
          <Link
            key={slot}
            href={`/book/${salonSlug}/confirm?serviceId=${serviceId}&employeeId=${employeeId}&date=${date}&slot=${slot}`}
            className="rounded border border-indigo-200 bg-white px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50 transition-colors"
          >
            {minutesToTime(slot)}
          </Link>
        ))}
      </div>
      <Link href={`/book/${salonSlug}?serviceId=${serviceId}&employeeId=${employeeId}`} className="mt-4 inline-block text-sm text-indigo-600 hover:underline">← Choisir une autre date</Link>
    </div>
  );
}
