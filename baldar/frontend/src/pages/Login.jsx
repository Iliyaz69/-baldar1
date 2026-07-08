import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { ROLES } from "../lib/roles";

const ROLE_TABS = [
  { key: "TEACHER", label: "Воспитатель" },
  { key: "PARENT", label: "Родитель" },
  { key: "METHODIST", label: "Методист" },
  { key: "DIRECTOR", label: "Директор" },
  { key: "MEDICAL", label: "Медперсонал" },
  { key: "SUPERADMIN", label: "Суперадмин" },
];

export default function Login() {
  const [activeRole, setActiveRole] = useState("SUPERADMIN");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/login", { phone, password });
      if (data.user.role !== activeRole) {
        setError(`Этот аккаунт зарегистрирован как «${ROLES[data.user.role]?.label}», а не «${ROLES[activeRole]?.label}». Выберите правильную вкладку.`);
        return;
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Не удалось войти");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-role-parent/10 via-canvas to-brand/10 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-brand/10 text-brand flex items-center justify-center mx-auto mb-3 font-display text-2xl">
            Б
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink">Балдай</h1>
          <p className="text-sm text-muted mt-1">Система учёта посещаемости детского сада</p>
        </div>

        <div className="bg-surface border border-border rounded-xl2 overflow-hidden">
          <div className="flex flex-wrap border-b border-border">
            {ROLE_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveRole(tab.key);
                  setError("");
                }}
                className={`flex-1 min-w-[110px] px-3 py-3 text-sm transition-colors ${
                  activeRole === tab.key
                    ? "bg-canvas text-ink font-medium border-b-2 border-brand"
                    : "text-muted hover:text-ink"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
            <div>
              <label className="text-sm text-muted block mb-1">Вход для {ROLES[activeRole]?.label.toLowerCase()}</label>
              <p className="text-xs text-muted mb-3">Введите ваши данные для входа в систему</p>
              <input
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 mb-3"
                placeholder="Телефон, например +996000000001"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <input
                type="password"
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <div className="text-sm text-role-medical">{error}</div>}
            <button
              type="submit"
              className="w-full bg-brand text-white rounded-lg py-2 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Войти
            </button>
            <button type="button" className="text-xs text-muted hover:text-ink text-center">
              Забыли пароль?
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}