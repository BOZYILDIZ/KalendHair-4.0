import type { AdminAuditLogEntry } from "@/features/admin/types";

export function AdminAuditTable({ logs }: { logs: AdminAuditLogEntry[] }) {
  if (logs.length === 0) {
    return <p className="text-sm text-gray-400">Aucune action enregistrée.</p>;
  }

  return (
    <div className="overflow-x-auto rounded border">
      <table className="w-full text-sm">
        <thead className="border-b bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-2">Action</th>
            <th className="px-4 py-2">Admin</th>
            <th className="px-4 py-2">Organisation</th>
            <th className="px-4 py-2">Raison</th>
            <th className="px-4 py-2">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {logs.map((log) => (
            <tr key={log.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-xs">{log.action}</td>
              <td className="px-4 py-2">{log.adminName}</td>
              <td className="px-4 py-2 text-gray-500">
                {log.targetOrgName ?? "–"}
              </td>
              <td className="max-w-xs px-4 py-2 text-gray-600">
                <span className="line-clamp-2">{log.reason}</span>
              </td>
              <td className="px-4 py-2 text-gray-400">
                {log.createdAt.toLocaleString("fr-FR")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
