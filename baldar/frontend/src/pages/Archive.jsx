import { useEffect, useState } from "react";
import api from "../lib/api";

const ENTITY_LABELS = {
  Organization: "Организация",
  Child: "Ребёнок",
  Payment: "Платёж",
  PaymentCode: "Платёжный код",
};

export default function Archive() {
  const [records, setRecords] = useState([]);
  const [restoringId, setRestoringId] = useState(null);
  const [error, setError] = useState("");

  function load() {
    api.get("/archive").then((res) => setRecords(res.data));
  }

  useEffect(load, []);

  async function handleRestore(id) {
    setRestoringId(id);
    setError("");
    try {
      await api.post(`/archive/${id}/restore`);
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Не удалось восстановить запись");
    } finally {
      setRestoringId(null);
    }
  }

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Архив</h1>
        <p className="text-sm text-muted mt-1">Удалённые записи можно восстановить</p>
      </header>

      {error && <div className="text-sm text-role-medical mb-4">{error}</div>}

      {records.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl2 p-10 text-center">
          <div className="text-4xl mb-3">⌫</div>
          <div className="font-medium text-ink mb-1">Архив пуст</div>
          <div className="text-sm text-muted">Удалённые записи будут появляться здесь и их можно будет вернуть в любой момент.</div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {records.map((r) => (
            <div key={r.id} className="bg-surface border border-border rounded-xl2 p-4 flex items-center justify-between">
              <div>
                <div className="text-sm text-ink font-medium">
                  {ENTITY_LABELS[r.entityType] || r.entityType} #{r.entityId}
                </div>
                <div className="text-xs text-muted mt-0.5">
                  Удалено {new Date(r.deletedAt).toLocaleString("ru-RU")}
                </div>
              </div>
              <button
                onClick={() => handleRestore(r.id)}
                disabled={restoringId === r.id}
                className="text-sm text-brand hover:underline disabled:opacity-40"
              >
                {restoringId === r.id ? "Восстановление…" : "Восстановить"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
