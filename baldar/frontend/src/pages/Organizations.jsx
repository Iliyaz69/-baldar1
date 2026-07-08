import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import Modal from "../components/Modal";

export default function Organizations() {
  const [orgs, setOrgs] = useState([]);
  const [search, setSearch] = useState("");
  const [toDelete, setToDelete] = useState(null);
  const navigate = useNavigate();

  function load() {
    api.get("/organizations", { params: { search } }).then((res) => setOrgs(res.data));
  }

  useEffect(() => {
    load();
  }, [search]);

  async function confirmDelete() {
    await api.delete(`/organizations/${toDelete.id}`);
    setToDelete(null);
    load();
  }

  return (
    <div>
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Управление организациями</h1>
          <p className="text-sm text-muted mt-1">Просмотр и управление всеми детскими садами в системе</p>
        </div>
        <button
          onClick={() => navigate("/organizations/new")}
          className="bg-brand text-white text-sm px-4 py-2 rounded-lg hover:opacity-90"
        >
          + Добавить организацию
        </button>
      </header>

      <input
        className="w-full border border-border rounded-lg px-3 py-2 text-sm mb-4 bg-surface"
        placeholder="Поиск по названию или ИНН…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="flex flex-col gap-3">
        {orgs.map((org) => (
          <div key={org.id} className="bg-surface border border-border rounded-xl2 p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-ink">{org.nameOffLang || org.shortNameOff}</span>
                  <span className="text-xs text-muted">{org.shortNameOff}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded-full bg-canvas text-muted border border-border">ID {org.id}</span>
                <button
                  onClick={() => navigate(`/organizations/${org.id}/edit`)}
                  className="text-sm px-3 py-1.5 rounded-lg border border-border text-ink hover:bg-canvas"
                >
                  Редактировать
                </button>
                <button
                  onClick={() => setToDelete(org)}
                  className="text-sm px-3 py-1.5 rounded-lg bg-role-medical/10 text-role-medical hover:bg-role-medical/20"
                >
                  Удалить
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-sm">
              <div>
                <div className="text-muted text-xs">ИНН</div>
                <div className="text-ink">{org.inn}</div>
              </div>
              <div>
                <div className="text-muted text-xs">Телефон</div>
                <div className="text-ink">{org.phone}</div>
              </div>
              <div>
                <div className="text-muted text-xs">Район</div>
                <div className="text-ink">{org.district}</div>
              </div>
              <div>
                <div className="text-muted text-xs">Банковских счетов</div>
                <span className="inline-block px-2 py-0.5 rounded-full bg-role-parent/10 text-role-parent text-xs">
                  {org.bankAccounts?.length || 0}
                </span>
              </div>
            </div>
          </div>
        ))}
        {orgs.length === 0 && <div className="text-sm text-muted">Организации не найдены.</div>}
      </div>

      {toDelete && (
        <Modal
          title="Удалить организацию?"
          onClose={() => setToDelete(null)}
          footer={
            <>
              <button onClick={() => setToDelete(null)} className="text-sm px-4 py-2 rounded-lg border border-border text-ink">
                Отмена
              </button>
              <button onClick={confirmDelete} className="text-sm px-4 py-2 rounded-lg bg-role-medical text-white">
                Удалить
              </button>
            </>
          }
        >
          <div className="bg-role-medical/10 text-role-medical text-sm rounded-lg p-3">
            Организация «{toDelete.nameOffLang || toDelete.shortNameOff}» будет удалена из системы. Запись можно будет восстановить из архива.
          </div>
        </Modal>
      )}
    </div>
  );
}
