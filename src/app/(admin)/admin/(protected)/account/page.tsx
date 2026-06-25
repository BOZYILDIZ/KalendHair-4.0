import { ChangePasswordForm } from "@/features/admin/components/change-password-form";
import { changeAdminPasswordAction } from "./actions";

export const metadata = { title: "Mon compte — KalendHair Admin" };

export default function AdminAccountPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Mon compte</h1>
      <p className="text-sm text-gray-500 mb-8">
        Gérez votre mot de passe Super Admin.
      </p>

      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">
          Changer le mot de passe
        </h2>
        <ChangePasswordForm action={changeAdminPasswordAction} />
      </section>
    </div>
  );
}
