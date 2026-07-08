import { useEffect, useState } from "react";
import api from "../lib/api";
import MetricCard from "../components/MetricCard";

export default function Overview() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/overview").then((res) => setData(res.data));
  }, []);

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Обзор системы</h1>
        <p className="text-sm text-muted mt-1">Общее состояние всех детских садов сети «Балдай»</p>
      </header>

      {!data ? (
        <div className="text-muted text-sm">Загрузка данных…</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard icon="⌂" label="Всего организаций" value={data.organizationsTotal} context="активных в сети" tone="role-director" />
          <MetricCard icon="◔" label="Всего детей" value={data.childrenTotal} context="во всех садах" tone="role-teacher" />
          <MetricCard icon="◈" label="Пользователей" value={data.usersTotal} context="сотрудников и родителей" tone="role-parent" />
          <MetricCard
            icon="$"
            label="Оборот за месяц"
            value={`${data.monthlyTurnover} сом`}
            context="суммарно по сети"
            tone="role-methodist"
          />
          <MetricCard
            icon="▤"
            label="Средняя посещаемость"
            value={`${data.averageAttendanceRate}%`}
            context="по всем организациям"
            tone="role-parent"
          />
          <MetricCard
            icon="✓"
            label="Статус системы"
            value={data.systemStatus === "STABLE" ? "Стабильно" : "Требует внимания"}
            context="все сервисы работают"
            tone={data.systemStatus === "STABLE" ? "role-parent" : "role-medical"}
          />
        </div>
      )}
    </div>
  );
}