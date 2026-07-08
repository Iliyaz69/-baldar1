import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../lib/api";
import Field from "../components/Field";

const inputClass =
  "w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-brand/40";

const emptyForm = {
  nameStateLang: "",
  nameOffLang: "",
  shortNameState: "",
  shortNameOff: "",
  type: "Государственный",
  region: "",
  regNumber: "",
  okpo: "",
  inn: "",
  city: "",
  district: "",
  microdistrict: "",
  street: "",
  building: "",
  office: "",
  phone: "",
  email: "",
};

export default function OrganizationForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEdit) {
      api.get(`/organizations/${id}`).then((res) => {
        setForm(res.data);
        setBankAccounts(res.data.bankAccounts || []);
        setBranches(res.data.branches || []);
      });
    }
  }, [id]);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function addBankAccount() {
    setBankAccounts((b) => [...b, { accountNumber: "", bankName: "", purpose: "" }]);
  }

  function addBranch() {
    setBranches((b) => [...b, { name: "", address: "" }]);
  }

  const readyToSave = form.nameOffLang && form.inn && form.phone && bankAccounts.length > 0 && branches.length > 0;

  async function handleSave() {
    setSaving(true);
    setError("");
    const payload = { ...form, bankAccounts, branches };
    try {
      if (isEdit) {
        await api.put(`/organizations/${id}`, payload);
      } else {
        await api.post("/organizations", payload);
      }
      navigate("/organizations");
    } catch (err) {
      setError(err.response?.data?.error || "Не удалось сохранить организацию");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            {isEdit ? "Редактирование организации" : "Создание организации"}
          </h1>
          <p className="text-sm text-muted mt-1">Управление данными детского сада и контактной информацией</p>
        </div>
        <button onClick={() => navigate("/organizations")} className="text-sm text-muted hover:text-ink">
          Отмена
        </button>
      </header>

      <div className="bg-brand/5 border border-brand/20 text-sm text-ink rounded-xl2 p-4 mb-6">
        Заполните все обязательные поля. Поля, отмеченные как «необязательно», можно оставить пустыми.
      </div>

      <section className="bg-surface border border-border rounded-xl2 p-6 mb-4">
        <h3 className="font-medium text-ink mb-1">Наименования организации</h3>
        <p className="text-sm text-muted mb-4">Официальные названия на кыргызском и русском языках</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Полное наименование на государственном языке" required>
            <input className={inputClass} value={form.nameStateLang} onChange={(e) => set("nameStateLang", e.target.value)} />
          </Field>
          <Field label="Полное наименование на официальном языке" required>
            <input className={inputClass} value={form.nameOffLang} onChange={(e) => set("nameOffLang", e.target.value)} />
          </Field>
          <Field label="Сокращённое наименование на государственном языке" required>
            <input className={inputClass} value={form.shortNameState} onChange={(e) => set("shortNameState", e.target.value)} />
          </Field>
          <Field label="Сокращённое наименование на официальном языке" required>
            <input className={inputClass} value={form.shortNameOff} onChange={(e) => set("shortNameOff", e.target.value)} />
          </Field>
        </div>
      </section>

      <section className="bg-surface border border-border rounded-xl2 p-6 mb-4">
        <h3 className="font-medium text-ink mb-1">Регистрационные данные</h3>
        <p className="text-sm text-muted mb-4">Официальные регистрационные номера и коды</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Тип организации" required>
            <select className={inputClass} value={form.type} onChange={(e) => set("type", e.target.value)}>
              <option>Государственный</option>
              <option>Частный</option>
            </select>
          </Field>
          <Field label="Регион" required>
            <input className={inputClass} value={form.region} onChange={(e) => set("region", e.target.value)} />
          </Field>
          <Field label="Регистрационный номер" required>
            <input className={inputClass} value={form.regNumber} onChange={(e) => set("regNumber", e.target.value)} />
          </Field>
          <Field label="Код ОКПО" required hint="8 цифр">
            <input className={inputClass} value={form.okpo} onChange={(e) => set("okpo", e.target.value)} />
          </Field>
          <Field label="ИНН" required hint="14 цифр">
            <input className={inputClass} value={form.inn} onChange={(e) => set("inn", e.target.value)} />
          </Field>
        </div>
      </section>

      <section className="bg-surface border border-border rounded-xl2 p-6 mb-4">
        <h3 className="font-medium text-ink mb-1">Адрес организации</h3>
        <p className="text-sm text-muted mb-4">Полный юридический адрес детского сада</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Область/город республиканского значения" required>
            <input className={inputClass} value={form.city} onChange={(e) => set("city", e.target.value)} />
          </Field>
          <Field label="Район/город областного значения" required>
            <input className={inputClass} value={form.district} onChange={(e) => set("district", e.target.value)} />
          </Field>
          <Field label="Микрорайон/жилмассив">
            <input className={inputClass} value={form.microdistrict} onChange={(e) => set("microdistrict", e.target.value)} />
          </Field>
          <Field label="Улица (проспект, бульвар, переулок и т.п.)" required>
            <input className={inputClass} value={form.street} onChange={(e) => set("street", e.target.value)} />
          </Field>
          <Field label="№ дома" required>
            <input className={inputClass} value={form.building} onChange={(e) => set("building", e.target.value)} />
          </Field>
          <Field label="№ квартиры (офиса, комнаты и т.п.)">
            <input className={inputClass} value={form.office} onChange={(e) => set("office", e.target.value)} />
          </Field>
        </div>
      </section>

      <section className="bg-surface border border-border rounded-xl2 p-6 mb-4">
        <h3 className="font-medium text-ink mb-1">Контактная информация</h3>
        <p className="text-sm text-muted mb-4">Телефон и электронная почта для связи</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Телефон" required>
            <input className={inputClass} value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </Field>
          <Field label="Электронный адрес (e-mail)">
            <input className={inputClass} value={form.email} onChange={(e) => set("email", e.target.value)} />
          </Field>
        </div>
      </section>

      <section className="bg-role-methodist/5 border border-role-methodist/20 rounded-xl2 p-6 mb-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-medium text-ink">Банковские реквизиты</h3>
          <span className="text-xs px-2 py-1 rounded-full bg-role-methodist/10 text-role-methodist">
            {bankAccounts.length} счетов
          </span>
        </div>
        <p className="text-sm text-muted mb-4">Управление банковскими счетами и кодами платежей</p>
        {bankAccounts.map((acc, i) => (
          <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <input
              className={inputClass}
              placeholder="Номер счёта"
              value={acc.accountNumber}
              onChange={(e) => {
                const next = [...bankAccounts];
                next[i].accountNumber = e.target.value;
                setBankAccounts(next);
              }}
            />
            <input
              className={inputClass}
              placeholder="Банк"
              value={acc.bankName}
              onChange={(e) => {
                const next = [...bankAccounts];
                next[i].bankName = e.target.value;
                setBankAccounts(next);
              }}
            />
            <input
              className={inputClass}
              placeholder="Назначение"
              value={acc.purpose}
              onChange={(e) => {
                const next = [...bankAccounts];
                next[i].purpose = e.target.value;
                setBankAccounts(next);
              }}
            />
          </div>
        ))}
        <button onClick={addBankAccount} className="w-full border border-dashed border-role-methodist/40 rounded-lg py-3 text-sm text-role-methodist hover:bg-role-methodist/5">
          + Добавить банковский счёт
        </button>
        {bankAccounts.length === 0 && (
          <p className="text-sm text-role-medical mt-2">Необходимо добавить хотя бы один банковский счёт для организации</p>
        )}
      </section>

      <section className="bg-role-parent/5 border border-role-parent/20 rounded-xl2 p-6 mb-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-medium text-ink">Филиалы</h3>
          <span className="text-xs px-2 py-1 rounded-full bg-role-parent/10 text-role-parent">
            {branches.length} филиалов
          </span>
        </div>
        <p className="text-sm text-muted mb-4">Управление филиалами организации</p>
        {branches.map((br, i) => (
          <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <input
              className={inputClass}
              placeholder="Название филиала"
              value={br.name}
              onChange={(e) => {
                const next = [...branches];
                next[i].name = e.target.value;
                setBranches(next);
              }}
            />
            <input
              className={inputClass}
              placeholder="Адрес"
              value={br.address}
              onChange={(e) => {
                const next = [...branches];
                next[i].address = e.target.value;
                setBranches(next);
              }}
            />
          </div>
        ))}
        <button onClick={addBranch} className="w-full border border-dashed border-role-parent/40 rounded-lg py-3 text-sm text-role-parent hover:bg-role-parent/5">
          + Добавить филиал
        </button>
        {branches.length === 0 && (
          <p className="text-sm text-role-medical mt-2">Необходимо добавить хотя бы один филиал для организации</p>
        )}
      </section>

      <section className="bg-surface border border-border rounded-xl2 p-6 mb-6 flex items-center justify-between">
        <div>
          <h3 className="font-medium text-ink">{readyToSave ? "Все данные готовы к сохранению" : "Заполните обязательные поля"}</h3>
          <p className="text-sm text-muted">Убедитесь, что все обязательные поля заполнены корректно</p>
          {error && <p className="text-sm text-role-medical mt-2">{error}</p>}
        </div>
        <button
          onClick={handleSave}
          disabled={!readyToSave || saving}
          className="bg-brand text-white text-sm px-5 py-2 rounded-lg hover:opacity-90 disabled:opacity-40"
        >
          {saving ? "Сохранение…" : "Сохранить изменения"}
        </button>
      </section>
    </div>
  );
}
