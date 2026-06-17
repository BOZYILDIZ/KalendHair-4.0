import { getCurrentUser } from "@/lib/auth/session";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <p className="text-sm text-gray-600">
        Connecté · Organisation :{" "}
        <span className="font-mono">{user?.organizationId}</span>
      </p>
      <form action="/api/auth/logout" method="POST">
        <button
          type="submit"
          className="rounded border px-4 py-2 text-sm hover:bg-gray-50"
        >
          Se déconnecter
        </button>
      </form>
    </main>
  );
}
