export default function Field({ label, required, hint, children }) {
  return (
    <div>
      <label className="text-sm text-ink font-medium block mb-1">
        {label} {required && <span className="text-role-medical text-xs align-super">Обязательно</span>}
        {!required && <span className="text-muted text-xs align-super">Необязательно</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-muted mt-1">{hint}</p>}
    </div>
  );
}
