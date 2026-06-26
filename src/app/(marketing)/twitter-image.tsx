import { ImageResponse } from "next/og";

export const alt = "KalendHair — Logiciel de gestion de salon de coiffure";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0f172a",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Indigo radial glow */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            left: "50%",
            marginLeft: "-500px",
            width: "1000px",
            height: "500px",
            background:
              "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(79,70,229,0.45) 0%, transparent 70%)",
          }}
        />

        {/* K logo tile */}
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: 18,
            background: "#4f46e5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 28,
            boxShadow: "0 0 40px rgba(79,70,229,0.6)",
          }}
        >
          <span
            style={{
              color: "white",
              fontSize: 54,
              fontWeight: "bold",
              lineHeight: 1,
            }}
          >
            K
          </span>
        </div>

        <span
          style={{
            fontSize: 68,
            fontWeight: "bold",
            color: "white",
            marginBottom: 16,
            letterSpacing: "-2px",
          }}
        >
          KalendHair
        </span>

        <span
          style={{
            fontSize: 28,
            color: "#94a3b8",
            textAlign: "center",
            maxWidth: 640,
          }}
        >
          Agenda · Réservation · CRM · Caisse · Stocks
        </span>

        <span
          style={{
            position: "absolute",
            bottom: 28,
            color: "#475569",
            fontSize: 16,
          }}
        >
          kalendhair.fr
        </span>
      </div>
    ),
    { ...size },
  );
}
