export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "確定",
  cancelLabel = "取消",
  danger,
  onConfirm,
  onCancel,
}) {
  return (
    <div
      className="fixed inset-0 bg-ink/45 backdrop-blur-[2px] flex items-center justify-center p-5 z-[60] animate-[mc-fade_0.18s_ease_both]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="bg-wall rounded-[18px] w-full max-w-[320px] p-[22px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-[mc-rise_0.22s_ease_both]">
        {title && <h2 className="font-serif text-lg font-bold text-wood-deep m-0 mb-2">{title}</h2>}
        <p className="text-sm text-ink-soft m-0 mb-5 leading-relaxed">{message}</p>
        <div className="flex gap-2.5">
          <button
            className="flex-1 border-none rounded-[10px] p-2.5 text-sm font-semibold font-sans cursor-pointer bg-panel text-ink"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            className={`flex-1 border-none rounded-[10px] p-2.5 text-sm font-semibold font-sans cursor-pointer text-white ${
              danger
                ? "bg-[linear-gradient(155deg,var(--color-rose),var(--color-rose-deep))]"
                : "bg-wood-mid"
            }`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
