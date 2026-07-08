export default function Modal({ title, subtitle, onClose, children, footer }) {
  return (
    <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-xl2 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between p-6 border-b border-border">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
            {subtitle && <p className="text-sm text-muted mt-1">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-muted hover:text-ink text-xl leading-none">
            ×
          </button>
        </div>
        <div className="p-6">{children}</div>
        {footer && <div className="p-6 pt-0 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}
