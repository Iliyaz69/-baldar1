import { useEffect, useState } from "react";
import api from "../lib/api";
import MetricCard from "../components/MetricCard";

const STATUS_LABELS = {
  PRESENT: { label: "Присутствовал", className: "bg-role-parent/10 text-role-parent" },
  SICK: { label: "Болел", className: "bg-role-medical/10 text-role-medical" },
  OTHER: { label: "Другая причина", className: "bg-role-methodist/10 text-role-methodist" },
};

const PAYMENT_STATUS_LABELS = {
  PAID: { label: "Оплачено", className: "bg-role-parent/10 text-role-parent" },
  PENDING: { label: "Ожидает оплаты", className: "bg-role-methodist/10 text-role-methodist" },
  OVERDUE: { label: "Просрочено", className: "bg-role-medical/10 text-role-medical" },
};

function currentMonthValue() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default function ParentDashboard() {
  const [children, setChildren] = useState(null);
  const [activeChildId, setActiveChildId] = useState(null);
  const [month, setMonth] = useState(currentMonthValue());
  const [attendance, setAttendance] = useState(null);
  const [payments, setPayments] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/parent/children")
      .then((res) => {
        setChildren(res.data);
        if (res.data.length > 0) setActiveChildId(res.data[0].id);
      })
      .catch(() => setError("Не удалось загрузить данные детей"));
  }, []);

  useEffect(() => {
    if (!activeChildId) return;
    setAttendance(null);
    setPayments(null);
    api
      .get(`/parent/children/${activeChildId}/attendance`, { params: { month } })
      .then((res) => setAttendance(res.data))
      .catch(() => setError("Не удалось загрузить посещаемость"));
    api
      .get(`/parent/children/${activeChildId}/payments`)
      .then((res) => setPayments(res.data))
      .catch(() => setError("Не удалось загрузить счета"));
  }, [activeChildId, month]);

  const activeChild = children?.find((c) => c.id === activeChildId);

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Мой ребёнок</h1>
        <p className="text-sm text-muted mt-1">Посещаемость и оплата в одном месте</p>
      </header>

      {error && <div className="text-sm text-role-medical mb-4">{error}</div>}

      {!children ? (
        <div className="text-muted text-sm">Загрузка данных…</div>
      ) : children.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl2 p-10 text-center">
          <div className="text-4xl mb-3">◔</div>
          <div className="font-medium text-ink mb-1">Дети не найдены</div>
          <div className="text-sm text-muted">Обратитесь к администрации детского сада, чтобы привязать ребёнка к вашему аккаунту.</div>
        </div>
      ) : (
        <>
          {children.length > 1 && (
            <div className="flex gap-2 mb-6">
              {children.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveChildId(c.id)}
                  className={`px-4 py-2 rounded-lg text-sm ${
                    activeChildId === c.id ? "bg-role-parent text-white" : "bg-surface border border-border text-ink"
                  }`}
                >
                  {c.fullName}
                </button>
              ))}
            </div>
          )}

          {activeChild && (
            <div className="bg-surface border border-border rounded-xl2 p-5 mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-medium text-ink">{activeChild.fullName}</div>
                <div className="text-sm text-muted mt-0.5">
                  {activeChild.groupName ? `Группа «${activeChild.groupName}»` : "Группа не назначена"}
                  {activeChild.ageCategory && ` · ${activeChild.ageCategory}`}
                </div>
              </div>
              <div className="text-sm text-muted">{activeChild.organizationName}</div>
            </div>
          )}

          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg font-semibold text-ink">Посещаемость</h2>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="border border-border rounded-lg px-3 py-2 text-sm bg-surface"
            />
          </div>

          {!attendance ? (
            <div className="text-muted text-sm mb-8">Загрузка…</div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <MetricCard icon="✓" label="Присутствовал" value={attendance.presentDays} tone="role-parent" />
                <MetricCard icon="✚" label="Болел" value={attendance.sickDays} tone="role-medical" />
                <MetricCard icon="▤" label="Другие причины" value={attendance.otherDays} tone="role-methodist" />
                <MetricCard icon="◔" label="Посещаемость" value={`${attendance.attendanceRate}%`} tone="role-teacher" />
              </div>

              {attendance.records.length === 0 ? (
                <div className="bg-surface border border-border rounded-xl2 p-6 text-center text-sm text-muted mb-8">
                  За выбранный месяц отметок посещаемости пока нет.
                </div>
              ) : (
                <div className="bg-surface border border-border rounded-xl2 overflow-hidden mb-8">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-canvas text-muted text-left">
                        <th className="px-4 py-3 font-medium">Дата</th>
                        <th className="px-4 py-3 font-medium">Статус</th>
                        <th className="px-4 py-3 font-medium">Причина</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendance.records.map((r) => (
                        <tr key={r.date} className="border-t border-border">
                          <td className="px-4 py-3 text-ink">
                            {new Date(r.date).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" })}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded-full ${STATUS_LABELS[r.status]?.className}`}>
                              {STATUS_LABELS[r.status]?.label || r.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted">{r.illness || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          <h2 className="font-display text-lg font-semibold text-ink mb-3">Счета и оплата</h2>
          {!payments ? (
            <div className="text-muted text-sm">Загрузка…</div>
          ) : (
            <>
              {payments.totalDue > 0 && (
                <div className="bg-role-medical/5 border border-role-medical/20 rounded-xl2 p-4 mb-4 text-sm text-ink">
                  К оплате: <span className="font-semibold">{payments.totalDue} сом</span>
                </div>
              )}
              <div className="flex flex-col gap-3">
                {payments.payments.map((p) => (
                  <div key={p.id} className="bg-surface border border-border rounded-xl2 p-4 flex items-center justify-between">
                    <div>
                      <div className="text-ink font-medium">{p.codeName}</div>
                      <div className="text-xs text-muted mt-0.5">
                        {p.status === "PAID"
                          ? `Оплачено ${new Date(p.paidAt).toLocaleDateString("ru-RU")}`
                          : p.dueDate
                          ? `Срок оплаты: ${new Date(p.dueDate).toLocaleDateString("ru-RU")}`
                          : "Срок не указан"}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-display text-lg text-ink">{p.amount} сом</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${PAYMENT_STATUS_LABELS[p.status]?.className}`}>
                        {PAYMENT_STATUS_LABELS[p.status]?.label || p.status}
                      </span>
                    </div>
                  </div>
                ))}
                {payments.payments.length === 0 && (
                  <div className="text-sm text-muted">Счетов пока нет.</div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
