import type { Metadata } from "next";
import { HeroSection } from "./components/sections/hero-section";
import { TrustStrip } from "./components/sections/trust-strip";
import { ModuleGrid } from "./components/sections/module-grid";
import { JsonLd } from "./components/ui/json-ld";

export const metadata: Metadata = {
  title: {
    absolute: "KalendHair — Logiciel de gestion pour salons de coiffure",
  },
  description:
    "Gérez votre salon avec une seule plateforme : agenda, réservation en ligne, caisse, stocks et clients. Essayez KalendHair gratuitement.",
  alternates: {
    canonical: "https://kalendhair.fr/",
  },
  openGraph: {
    title: "KalendHair — Logiciel de gestion pour salons de coiffure",
    description:
      "Agenda, réservation en ligne, caisse, stocks et clients. Une seule plateforme pour tout gérer.",
    url: "https://kalendhair.fr/",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KalendHair — Logiciel de gestion pour salons de coiffure",
    description:
      "Agenda, réservation en ligne, caisse, stocks et clients. Une seule plateforme pour tout gérer.",
  },
};

const ORGANIZATION_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "KalendHair",
  url: "https://kalendhair.fr",
  logo: "https://kalendhair.fr/logo.png",
  contactPoint: {
    "@type": "ContactPoint",
    email: "contact@kalendhair.fr",
    contactType: "customer service",
    availableLanguage: "French",
  },
};

const SOFTWARE_APPLICATION_LD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "KalendHair",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Logiciel de gestion pour salons de coiffure. Agenda, réservation en ligne, CRM clients, caisse, stocks et fournisseurs.",
  url: "https://kalendhair.fr",
  inLanguage: "fr",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "EUR",
    description: "Accès pilote gratuit pendant la phase de test.",
  },
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={ORGANIZATION_LD} />
      <JsonLd data={SOFTWARE_APPLICATION_LD} />
      <HeroSection />
      <TrustStrip />
      <ModuleGrid />
    </>
  );
}
