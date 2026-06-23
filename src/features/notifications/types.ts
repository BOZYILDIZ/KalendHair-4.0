// Types partagés pour les notifications email — données d'un rendez-vous

export type NotificationContext = {
  appointmentId: string;
  organizationId: string;
  salonId: string;
  salonName: string;
  salonPhone: string | null;
  salonEmail: string | null;
  salonSlug: string;
  salonTimezone: string;
  serviceName: string;
  serviceDurationMinutes: number;
  /** Prix catalogue en centimes — utilisé si priceCentsSnapshot est null */
  servicePriceCents: number;
  /** Prix figé au moment de la réservation, peut différer du catalogue */
  priceCentsSnapshot: number | null;
  employeeFirstName: string;
  employeeLastName: string;
  recipientEmail: string;
  recipientFirstName: string;
  recipientLastName: string;
  clientId: string | null;
  startAt: Date;
};
