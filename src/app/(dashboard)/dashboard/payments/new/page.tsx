import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getSalon } from "@/features/salons/salon.service";
import { canManagePayment } from "@/lib/permissions/payment.permissions";
import { FreePaymentForm } from "@/features/payments/components/payment-form";
import { createFreePaymentAction } from "./actions";
import type { PaymentFormState } from "@/features/payments/types";

export default async function NewFreePaymentPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const salon = await getSalon(session.organizationId);
  if (!salon || !canManagePayment(session, session.organizationId)) {
    redirect("/dashboard");
  }

  const boundAction = async (
    prev: PaymentFormState,
    formData: FormData,
  ): Promise<PaymentFormState> => {
    "use server";
    return createFreePaymentAction(prev, formData);
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/dashboard/payments"
          className="text-sm text-indigo-600 hover:underline"
        >
          ← Caisse
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Paiement libre</h1>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <FreePaymentForm action={boundAction} />
      </div>
    </div>
  );
}
