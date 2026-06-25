import Link from "next/link";

const NAV_ITEMS = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/organizations", label: "Organisations" },
  { href: "/admin/subscriptions", label: "Abonnements" },
  { href: "/admin/metrics", label: "Métriques" },
  { href: "/admin/account", label: "Mon compte" },
];

export function AdminSidebar() {
  return (
    <aside className="flex w-56 flex-col border-r border-gray-200 bg-gray-900 text-white">
      <div className="border-b border-gray-700 px-4 py-5">
        <p className="text-sm font-bold uppercase tracking-widest text-gray-400">
          KalendHair
        </p>
        <p className="text-lg font-semibold">Super Admin</p>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-gray-700 px-4 py-4">
        <form action="/api/admin/logout" method="POST">
          <button
            type="submit"
            className="w-full rounded px-3 py-2 text-left text-sm text-gray-400 hover:text-white"
          >
            Déconnexion
          </button>
        </form>
      </div>
    </aside>
  );
}
