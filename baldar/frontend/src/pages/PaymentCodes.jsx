import { useEffect, useState } from "react";
import api from "../lib/api";
import Modal from "../components/Modal";
import Field from "../components/Field";

const inputClass =
  "w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-brand/40";

const emptyForm = { code: "", shortName: "", fullName: "", startDate: "", endDate: "", status: "ACTIVE" };

export default function PaymentCodes() {
  const [codes, setCodes] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  function load() {
    api.get("/payment-codes").then((res) => setCodes(res.data));
  }

  useEffect(load, []);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await api.post("/payment-codes", form);
      setShowModal(false);
      setForm(emptyForm);
      load();
    } finally {
      setSaving(false);
    }
  }

  const filtered = codes.filter(
    (c) =>
      c.code.includes(search) ||
      c.shortName.toLowerCase().includes(search.toLowerCase()) ||
      c.fullName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Платёжные коды</h1>
          <p className="text-sm text-muted mt-1">Список услуг по платёжным кодам</p>
        </div>
        <div className="flex gap-2">
          <button className="text-sm px-4 py-2 rounded-lg border border-border text-ink hover:bg-canvas">
            ↓ Загрузить Excel
          </button>
          <button onClick={() => setShowModal(true)} className="bg-brand text-white text-sm px-4 py-2 rounded-lg hover:opacity-90">
            + Добавить код
          </button>
        </div>
      </header>

      <input
        className="w-full border border-border rounded-lg px-3 py-2 text-sm mb-4 bg-surface"
        placeholder="Поиск по коду или названию…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="bg-surface border border-border rounded-xl2 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-canvas text-muted text-left">
              <th className="px-4 py-3 font-medium">Код</th>
              <th className="px-4 py-3 font-medium">Короткое название</th>
              <th className="px-4 py-3 font-medium">Полное название</th>
              <th className="px-4 py-3 font-medium">Дата начала</th>
              <th className="px-4 py-3 font-medium">Статус</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-t border-border align-top">
                <td className="px-4 py-3 text-ink">{c.code}</td>
                <td className="px-4 py-3 text-ink">{c.shortName}</td>
                <td className="px-4 py-3 text-muted max-w-sm">{c.fullName}</td>
                <td className="px-4 py-3 text-muted">{new Date(c.startDate).toLocaleDateString("ru-RU")}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      c.status === "ACTIVE" ? "bg-role-parent/10 text-role-parent" : "bg-role-medical/10 text-role-medical"
                    }`}
                  >
                    {c.status === "ACTIVE" ? "Активен" : "Неактивен"}
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-muted">
                  Коды не найдены
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal
          title="Добавление кода платежа"
          subtitle="Управление данными платёжного кода"
          onClose={() => setShowModal(false)}
          footer={
            <>
              <button onClick={() => setShowModal(false)} className="text-sm px-4 py-2 rounded-lg border border-border text-ink">
                Закрыть
              </button>
              <button onClick={handleSave} disabled={saving} className="text-sm px-4 py-2 rounded-lg bg-brand text-white disabled:opacity-40">
                {saving ? "Сохранение…" : "Сохранить"}
              </button>
            </>
          }
        >
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Код" required>
                <input className={inputClass} value={form.code} onChange={(e) => set("code", e.target.value)} />
              </Field>
              <Field label="Короткое название" required>
                <input className={inputClass} value={form.shortName} onChange={(e) => set("shortName", e.target.value)} />
              </Field>
            </div>
            <Field label="Полное название" required>
              <textarea className={inputClass} rows={3} value={form.fullName} onChange={(e) => set("fullName", e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Дата начала" required>
                <input type="date" className={inputClass} value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
              </Field>
              <Field label="Дата окончания">
                <input type="date" className={inputClass} value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
              </Field>
            </div>
            <Field label="Статус" required>
              <select className={inputClass} value={form.status} onChange={(e) => set("status", e.target.value)}>
                <option value="ACTIVE">Активен</option>
                <option value="INACTIVE">Неактивен</option>
              </select>
            </Field>
          </div>
        </Modal>
      )}
    </div>
  );
}
