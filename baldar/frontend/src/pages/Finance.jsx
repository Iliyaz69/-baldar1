import { useEffect, useState } from "react";
import api from "../lib/api";
import MetricCard from "../components/MetricCard";

export default function Finance() {
  const [summary, setSummary] = useState(null);
  const [orgs, setOrgs] = useState([]);

  useEffect(() => {
    api.get("/finance/summary").then((res) => setSummary(res.data));
    api.get("/finance-organizations").then((res) => setOrgs(res.data));
  }, []);

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Финансы</h1>
        <p className="text-sm text-muted mt-1">Агрегированная финансовая статистика по всем организациям</p>
      </header>

      {!summary ? (
        <div className="text-muted text-sm">Загрузка данных…</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard icon="$" label="Общий доход" value={`${summary.totalIncome} сом`} context="за период" tone="role-methodist" />
          <MetricCard icon="✓" label="Оплачено" value={summary.paidCount} context="счетов" tone="role-parent" />
          <MetricCard icon="◔" label="Ожидают оплаты" value={summary.pendingCount} context="счетов" tone="role-teacher" />
          <MetricCard
            icon="↑"
            label="Задолженность"
            value={`${summary.debt} сом`}
            tone="role-medical"
            trend={summary.debt > 0 ? { direction: "up", value: "требует внимания" } : undefined}
          />
        </div>
      )}

      <h2 className="font-display text-lg font-semibold text-ink mb-3">По организациям</h2>
      <div className="flex flex-col gap-4">
        {orgs.map((org) => (
          <div key={org.id} className="bg-surface border border-border rounded-xl2 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="font-medium text-ink">{org.name}</div>
              <div className="font-display text-lg text-ink">{org.totalAmount} сом</div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
              <div className="bg-role-parent/5 rounded-lg p-3">
                <div className="text-muted text-xs">Оплачено</div>
                <div className="text-role-parent font-medium">{org.paidCount}</div>
              </div>
              <div className="bg-role-methodist/5 rounded-lg p-3">
                <div className="text-muted text-xs">Ожидают</div>
                <div className="text-role-methodist font-medium">{org.pendingCount}</div>
              </div>
              <div className="bg-role-medical/5 rounded-lg p-3">
                <div className="text-muted text-xs">Задолженность</div>
                <div className="text-role-medical font-medium">{org.debt} сом</div>
              </div>
            </div>
            {org.groups.length > 0 && (
              <div>
                <div className="text-xs text-muted mb-2">Статистика по группам</div>
                {org.groups.map((g) => (
                  <div key={g.id} className="flex items-center justify-between border-t border-border py-2 text-sm">
                    <div>
                      <span className="text-ink font-medium">{g.name}</span>
                      <span className="text-muted ml-2">
                        Всего: {g.totalChildren} · Оплачено: {g.paidChildren} · Не оплачено: {g.unpaidChildren}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {orgs.length === 0 && <div className="text-sm text-muted">Нет данных по организациям.</div>}
      </div>
    </div>
  );
}