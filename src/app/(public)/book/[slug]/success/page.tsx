import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublicSalon } from "@/features/booking/booking.service";
import { BookingSalonHeader } from "@/features/booking/components/booking-salon-header";

export default async function SuccessPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const salon = await getPublicSalon(slug);
  if (!salon) notFound();

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <BookingSalonHeader salon={salon} />
      <div className="mt-8 rounded-lg border border-green-200 bg-green-50 p-6 text-center">
        <p className="text-4xl">✓</p>
        <h2 className="mt-2 text-xl font-semibold text-green-800">
          Rendez-vous enregistré
        </h2>
        <p className="mt-2 text-sm text-green-700">
          Votre demande a bien été reçue. Le salon vous contactera pour confirmation.
        </p>
      </div>
      <div className="mt-6 text-center">
        <Link href={`/book/${slug}`} className="text-sm text-indigo-600 hover:underline">
          Prendre un autre rendez-vous
        </Link>
      </div>
    </main>
  );
}
