import { ImageResponse } from "next/og";

export const alt = "KalendHair — Logiciel de gestion de salon de coiffure";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
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
            width: 96,
            height: 96,
            borderRadius: 20,
            background: "#4f46e5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 32,
            boxShadow: "0 0 40px rgba(79,70,229,0.6)",
          }}
        >
          <span
            style={{
              color: "white",
              fontSize: 60,
              fontWeight: "bold",
              lineHeight: 1,
            }}
          >
            K
          </span>
        </div>

        {/* Brand name */}
        <span
          style={{
            fontSize: 72,
            fontWeight: "bold",
            color: "white",
            marginBottom: 20,
            letterSpacing: "-2px",
          }}
        >
          KalendHair
        </span>

        {/* Tagline */}
        <span
          style={{
            fontSize: 30,
            color: "#94a3b8",
            textAlign: "center",
            maxWidth: 680,
            lineHeight: 1.4,
          }}
        >
          Logiciel de gestion pour salons de coiffure
        </span>

        {/* Pilot badge */}
        <div
          style={{
            marginTop: 48,
            display: "flex",
            alignItems: "center",
            background: "rgba(79,70,229,0.18)",
            border: "1px solid rgba(99,102,241,0.4)",
            borderRadius: 100,
            padding: "12px 28px",
          }}
        >
          <span
            style={{
              color: "#a5b4fc",
              fontSize: 22,
              fontWeight: 500,
            }}
          >
            ★ Pilote gratuit ouvert — rejoignez les premiers salons
          </span>
        </div>

        {/* Bottom domain */}
        <span
          style={{
            position: "absolute",
            bottom: 32,
            color: "#475569",
            fontSize: 18,
          }}
        >
          kalendhair.fr
        </span>
      </div>
    ),
    { ...size },
  );
}
