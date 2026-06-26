/**
 * Injects a JSON-LD structured data script tag.
 * Use in Server Components only — no 'use client' required.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
