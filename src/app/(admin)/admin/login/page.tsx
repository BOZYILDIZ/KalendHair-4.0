import { AdminLoginForm } from "@/features/admin/components/admin-login-form";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm space-y-6 rounded-lg bg-white p-8 shadow-md">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            KalendHair Admin
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Espace Super Administrateur
          </p>
        </div>
        <AdminLoginForm />
      </div>
    </div>
  );
}
