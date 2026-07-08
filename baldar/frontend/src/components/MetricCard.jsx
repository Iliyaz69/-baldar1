// Карточка-метрика: цветной чип-иконка + число + контекстная строка + мини-тренд (см. раздел 4.2 ТЗ)
// tone — акцентный цвет иконки (напр. "brand", "role-parent", "role-medical"...), по умолчанию "brand"
export default function MetricCard({ icon, label, value, context, trend, badge, tone = "brand" }) {
  return (
    <div className="bg-surface border border-border rounded-xl2 p-5 flex flex-col gap-3 hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-2">
        <span className={`w-8 h-8 rounded-lg bg-${tone}/10 text-${tone} flex items-center justify-center text-base leading-none shrink-0`}>
          {icon}
        </span>
        <span className="text-muted text-sm">{label}</span>
        {badge && (
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-role-medical/10 text-role-medical font-medium">
            {badge}
          </span>
        )}
      </div>
      <div className="flex items-end gap-2">
        <span className="font-display text-3xl font-semibold text-ink">{value}</span>
        {trend && (
          <span className={trend.direction === "up" ? "text-role-medical text-sm" : "text-role-parent text-sm"}>
            {trend.direction === "up" ? "↑" : "↓"} {trend.value}
          </span>
        )}
      </div>
      {context && <div className="text-sm text-muted">{context}</div>}
    </div>
  );
}
