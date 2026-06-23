"use server";

import { redirect } from "next/navigation";
import { createPublicAppointment } from "@/features/booking/booking.service";
import { PublicBookingSchema } from "@/features/booking/booking.schema";
import type { PublicBookingFormState } from "@/features/booking/types";

// salonId + organizationId + salonSlug are resolved server-side from the slug
// and bound via .bind() in the page — never transmitted by the client.
export async function bookAppointmentAction(
  salonId: string,
  organizationId: string,
  salonSlug: string,
  _prevState: PublicBookingFormState,
  formData: FormData,
): Promise<PublicBookingFormState> {
  const raw = {
    firstName:  formData.get("firstName"),
    lastName:   formData.get("lastName"),
    email:      formData.get("email"),
    phone:      formData.get("phone"),
    serviceId:  formData.get("serviceId"),
    employeeId: formData.get("employeeId"),
    date:       formData.get("date"),
    slot:       formData.get("slot"),
  };

  const parsed = PublicBookingSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides",
    };
  }

  const { data } = parsed;

  const result = await createPublicAppointment(salonId, organizationId, {
    serviceId:  data.serviceId,
    employeeId: data.employeeId,
    date:       data.date,
    slot:       parseInt(data.slot, 10),
    firstName:  data.firstName,
    lastName:   data.lastName,
    email:      data.email,
    phone:      data.phone,
  });

  if (!result.ok) {
    return { success: false, error: result.error };
  }

  redirect(`/book/${salonSlug}/success?appointmentId=${result.appointmentId}`);
}
