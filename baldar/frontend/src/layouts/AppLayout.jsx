import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { roleAccent, roleLabel } from "../lib/roles";

const NAV_ITEMS = {
  SUPERADMIN: [
    { to: "/", label: "Обзор системы", icon: "◈" },
    { to: "/organizations", label: "Организации", icon: "⌂" },
    { to: "/payment-codes", label: "Платёжные коды", icon: "▤" },
    { to: "/finance", label: "Финансы", icon: "$" },
    { to: "/attendance", label: "Посещаемость", icon: "◔" },
    { to: "/archive", label: "Архив", icon: "⌫" },
  ],
  TEACHER: [{ to: "/", label: "Посещаемость группы", icon: "◔" }],
  PARENT: [{ to: "/", label: "Мой ребёнок", icon: "◔" }],
  // Остальные роли пока используют временную заглушку главной страницы —
  // будут расширены полноценными разделами в следующих итерациях.
  DIRECTOR: [{ to: "/", label: "Главная", icon: "◈" }],
  METHODIST: [{ to: "/", label: "Главная", icon: "◈" }],
  MEDICAL: [{ to: "/", label: "Главная", icon: "◈" }],
};

export default function AppLayout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const accent = roleAccent(user?.role);
  const items = NAV_ITEMS[user?.role] || NAV_ITEMS.SUPERADMIN;

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  return (
    <div className="min-h-screen flex bg-canvas">
      <aside className="w-64 shrink-0 bg-surface border-r border-border flex flex-col">
        <div className={`h-1.5 bg-${accent}`} />
        <div className="p-6 border-b border-border flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl2 bg-${accent}/15 text-${accent} flex items-center justify-center font-display text-lg font-semibold shrink-0`}>
            Б
          </div>
          <div>
            <div className="font-display text-lg font-semibold text-ink leading-tight">Балдай</div>
            <div className={`mt-0.5 inline-block text-xs px-2 py-0.5 rounded-full bg-${accent}/10 text-${accent} font-medium`}>
              {roleLabel(user?.role)}
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 flex flex-col gap-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors border-l-2 ${
                  isActive
                    ? `bg-${accent}/10 text-${accent} font-medium border-${accent}`
                    : "text-ink hover:bg-canvas border-transparent"
                }`
              }
            >
              <span className="w-5 text-center">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <button onClick={logout} className="w-full text-sm text-muted hover:text-ink px-3 py-2 text-left">
            Выйти
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto bg-gradient-to-br from-role-parent/5 via-canvas to-brand/5">
        <Outlet />
      </main>
    </div>
  );
}
