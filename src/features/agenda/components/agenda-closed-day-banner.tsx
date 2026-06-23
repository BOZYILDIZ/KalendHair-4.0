type Props = {
  reason: string | null;
  type: "closed-day" | "salon-closed";
};

export function AgendaClosedDayBanner({ reason, type }: Props) {
  const message =
    type === "closed-day"
      ? reason
        ? `Jour de fermeture exceptionnel — ${reason}`
        : "Jour de fermeture exceptionnel"
      : "Salon fermé ce jour";

  return (
    <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      <span className="font-medium">⚠ {message}</span>
    </div>
  );
}
