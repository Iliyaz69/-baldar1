import { useEffect, useState } from "react";
import api from "../lib/api";
import MetricCard from "../components/MetricCard";

const ILLNESS_TYPES = ["ОРВИ", "Грипп", "Ангина", "Ветрянка", "Другое"];

export default function Attendance() {
  const [period, setPeriod] = useState("day");
  const [report, setReport] = useState(null);

  useEffect(() => {
    api.get("/attendance/report", { params: { period } }).then((res) => setReport(res.data));
  }, [period]);

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Посещаемость и заболеваемость</h1>
        <p className="text-sm text-muted mt-1">Агрегированная статистика по всем организациям с детализацией по видам болезней</p>
      </header>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setPeriod("day")}
          className={`px-4 py-2 rounded-lg text-sm ${period === "day" ? "bg-brand text-white" : "bg-surface border border-border text-ink"}`}
        >
          Дневной отчёт
        </button>
        <button
          onClick={() => setPeriod("month")}
          className={`px-4 py-2 rounded-lg text-sm ${period === "month" ? "bg-brand text-white" : "bg-surface border border-border text-ink"}`}
        >
          Месячный отчёт
        </button>
      </div>

      {!report ? (
        <div className="text-muted text-sm">Загрузка данных…</div>
      ) : (
        <>
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 ${
              period === "day" ? "lg:grid-cols-5" : "lg:grid-cols-4"
            }`}
          >
            {period === "day" && <MetricCard icon="●" label="Всего детей" value={report.total} tone="role-director" />}
            <MetricCard icon="✓" label="Присутствуют" value={report.present} tone="role-parent" />
            <MetricCard
              icon="✚"
              label="По болезни"
              value={report.sick}
              tone="role-medical"
              badge={`${report.total ? Math.round((report.sick / report.total) * 100) : 0}%`}
            />
            <MetricCard icon="▤" label="Другие причины" value={report.other} tone="role-methodist" />
            <MetricCard icon="◔" label="Посещаемость" value={`${report.attendanceRate}%`} tone="role-teacher" />
          </div>

          <h2 className="font-display text-lg font-semibold text-ink mb-3">
            Статистика по видам болезней {period === "day" ? "(сегодня)" : "(за месяц)"}
          </h2>
          <div className="bg-surface border border-border rounded-xl2 p-5 mb-8 flex flex-wrap gap-3">
            {ILLNESS_TYPES.map((type) => {
              const count = report.illnessBreakdown?.[type] || 0;
              const percent = report.sick ? Math.round((count / report.sick) * 100) : 0;
              return (
                <div key={type} className="flex-1 min-w-[110px] bg-canvas rounded-lg p-3 text-center">
                  <div className="text-xs text-muted">{type}</div>
                  <div className="font-display text-lg text-ink">{count}</div>
                  <div className="text-xs text-muted">{report.sick ? `${percent}%` : "—"}</div>
                </div>
              );
            })}
          </div>

          <h2 className="font-display text-lg font-semibold text-ink mb-1">
            Детализация по организациям {period === "month" && "(месяц)"}
          </h2>
          <p className="text-sm text-muted mb-3">
            Показано {report.organizationDetails?.length || 0} организаций
          </p>
          <div className="bg-surface border border-border rounded-xl2 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-canvas text-muted text-left">
                  <th className="px-4 py-3 font-medium">Организация</th>
                  <th className="px-4 py-3 font-medium">Филиал</th>
                  <th className="px-4 py-3 font-medium">Всего</th>
                  <th className="px-4 py-3 font-medium">Присутствуют</th>
                  <th className="px-4 py-3 font-medium">Болеют</th>
                  <th className="px-4 py-3 font-medium">% болеющих</th>
                </tr>
              </thead>
              <tbody>
                {report.organizationDetails?.map((org) => (
                  <tr key={org.organizationId} className="border-t border-border">
                    <td className="px-4 py-3 text-ink">{org.organizationName}</td>
                    <td className="px-4 py-3 text-muted">{org.branch}</td>
                    <td className="px-4 py-3 text-ink">{org.total}</td>
                    <td className="px-4 py-3 text-ink">{org.present}</td>
                    <td className="px-4 py-3 text-ink">{org.sick}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          org.sickPercent > 50 ? "bg-role-medical/10 text-role-medical" : "bg-role-parent/10 text-role-parent"
                        }`}
                      >
                        {org.sickPercent}%
                      </span>
                    </td>
                  </tr>
                ))}
                {(!report.organizationDetails || report.organizationDetails.length === 0) && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-muted">
                      Нет данных за выбранный период
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}