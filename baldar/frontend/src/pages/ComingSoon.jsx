import { roleAccent, roleLabel } from "../lib/roles";

export default function ComingSoon() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const accent = roleAccent(user?.role);

  return (
    <div className="bg-surface border border-border rounded-xl2 p-10 text-center max-w-lg mx-auto mt-12">
      <div className={`w-14 h-14 rounded-full bg-${accent}/10 text-${accent} flex items-center justify-center mx-auto mb-4 text-2xl`}>
        ◈
      </div>
      <h1 className="font-display text-xl font-semibold text-ink mb-2">
        Раздел «{roleLabel(user?.role)}» в разработке
      </h1>
      <p className="text-sm text-muted">
        Эта роль будет доступна в одном из следующих обновлений системы. Пока функциональность реализована
        для суперадминистратора и воспитателя.
      </p>
    </div>
  );
}
