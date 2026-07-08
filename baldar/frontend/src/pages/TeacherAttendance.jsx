import { useEffect, useState } from "react";
import api from "../lib/api";

const ILLNESS_TYPES = ["ОРВИ", "Грипп", "Ангина", "Ветрянка", "Другое"];

const STATUS_OPTIONS = [
  { value: "PRESENT", label: "Присутствует", activeClass: "bg-role-parent text-white border-role-parent" },
  { value: "SICK", label: "Болеет", activeClass: "bg-role-medical text-white border-role-medical" },
  { value: "OTHER", label: "Другая причина", activeClass: "bg-role-methodist text-white border-role-methodist" },
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function TeacherAttendance() {
  const [date, setDate] = useState(todayISO());
  const [groups, setGroups] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingChildId, setSavingChildId] = useState(null);
  const [savedChildId, setSavedChildId] = useState(null);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    api
      .get("/attendance/my-groups", { params: { date } })
      .then((res) => setGroups(res.data.groups))
      .catch(() => setError("Не удалось загрузить список детей"))
      .finally(() => setLoading(false));
  }

  useEffect(load, [date]);

  async function markAttendance(childId, status, illness) {
    setSavingChildId(childId);
    setError("");
    try {
      await api.post("/attendance", { childId, date, status, illness: status === "SICK" ? illness : undefined });
      setSavedChildId(childId);
      setTimeout(() => setSavedChildId((id) => (id === childId ? null : id)), 1500);
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Не удалось сохранить отметку");
    } finally {
      setSavingChildId(null);
    }
  }

  const isToday = date === todayISO();
  const totalChildren = groups?.reduce((sum, g) => sum + g.children.length, 0) || 0;
  const markedCount =
    groups?.reduce((sum, g) => sum + g.children.filter((c) => c.attendanceToday).length, 0) || 0;

  return (
    <div>
      <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Отметка посещаемости</h1>
          <p className="text-sm text-muted mt-1">Ежедневная отметка присутствия и отсутствия детей вашей группы</p>
        </div>
        <input
          type="date"
          value={date}
          max={todayISO()}
          onChange={(e) => setDate(e.target.value)}
          className="border border-border rounded-lg px-3 py-2 text-sm bg-surface"
        />
      </header>

      {error && <div className="text-sm text-role-medical mb-4">{error}</div>}

      {loading ? (
        <div className="text-muted text-sm">Загрузка данных…</div>
      ) : !groups || groups.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl2 p-10 text-center">
          <div className="text-4xl mb-3">◔</div>
          <div className="font-medium text-ink mb-1">За вами пока не закреплена группа</div>
          <div className="text-sm text-muted">Обратитесь к директору или методисту вашего сада.</div>
        </div>
      ) : (
        <>
          {isToday && totalChildren > 0 && (
            <div className="bg-role-teacher/5 border border-role-teacher/20 rounded-xl2 p-4 mb-6 text-sm text-ink">
              Отмечено {markedCount} из {totalChildren} детей на сегодня
            </div>
          )}

          {groups.map((group) => (
            <section key={group.id} className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="font-display text-lg font-semibold text-ink">{group.name}</h2>
                {group.ageCategory && <span className="text-xs text-muted">{group.ageCategory}</span>}
              </div>

              <div className="flex flex-col gap-3">
                {group.children.map((child) => {
                  const current = child.attendanceToday;
                  const isSaving = savingChildId === child.id;
                  return (
                    <div key={child.id} className="bg-surface border border-border rounded-xl2 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-ink">{child.fullName}</span>
                          {savedChildId === child.id && (
                            <span className="text-xs text-role-parent">✓ Сохранено</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {STATUS_OPTIONS.map((opt) => {
                            const isActive = current?.status === opt.value;
                            return (
                              <button
                                key={opt.value}
                                disabled={isSaving}
                                onClick={() => markAttendance(child.id, opt.value, current?.illness)}
                                className={`text-sm px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-40 ${
                                  isActive ? opt.activeClass : "border-border text-ink hover:bg-canvas"
                                }`}
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {current?.status === "SICK" && (
                        <div className="mt-3 flex items-center gap-2">
                          <label className="text-xs text-muted">Причина болезни:</label>
                          <select
                            className="border border-border rounded-lg px-2 py-1 text-sm bg-surface"
                            value={current.illness || ""}
                            onChange={(e) => markAttendance(child.id, "SICK", e.target.value)}
                          >
                            <option value="">Выберите тип</option>
                            {ILLNESS_TYPES.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  );
                })}
                {group.children.length === 0 && (
                  <div className="text-sm text-muted">В этой группе пока нет детей.</div>
                )}
              </div>
            </section>
          ))}
        </>
      )}
    </div>
  );
}
