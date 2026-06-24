import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export default async function SuspendedPage() {
  const session = await getSession();

  let suspensionReason: string | null = null;
  if (session) {
    const org = await prisma.organization.findUnique({
      where: { id: session.organizationId },
      select: { suspensionReason: true },
    });
    suspensionReason = org?.suspensionReason ?? null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md space-y-4 rounded-lg border border-red-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
          <span className="text-2xl">🔒</span>
        </div>
        <h1 className="text-xl font-bold text-red-700">Compte suspendu</h1>
        <p className="text-sm text-gray-600">
          Votre compte a été temporairement suspendu par l&#39;équipe KalendHair.
        </p>
        {suspensionReason && (
          <p className="rounded bg-red-50 p-3 text-sm text-red-700">
            {suspensionReason}
          </p>
        )}
        <p className="text-sm text-gray-500">
          Pour toute question, contactez le support :{" "}
          <a
            href="mailto:support@kalend.dev"
            className="text-blue-600 hover:underline"
          >
            support@kalend.dev
          </a>
        </p>
      </div>
    </div>
  );
}
