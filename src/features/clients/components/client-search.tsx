"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";

type Props = {
  initialValue?: string;
};

export function ClientSearch({ initialValue = "" }: Props) {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams();
      if (value.trim()) params.set("q", value.trim());
      router.push(`/dashboard/clients?${params.toString()}`);
    }, 300);
  }

  return (
    <input
      type="search"
      defaultValue={initialValue}
      onChange={handleChange}
      placeholder="Rechercher par nom, email ou téléphone…"
      className="w-full max-w-sm rounded border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
    />
  );
}
