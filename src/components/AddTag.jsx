import { useState } from "react";
import { X, Loader2 } from "lucide-react";

export default function AddTag({ saving, onClose, onAdd }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("請輸入分類名稱");
      return;
    }
    const result = await onAdd(name);
    if (result) setError(result);
  };

  return (
    <div
      className="fixed inset-0 bg-ink/45 backdrop-blur-[2px] flex items-center justify-center p-5 z-[60] animate-[mc-fade_0.18s_ease_both]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-wall rounded-[18px] w-full max-w-[320px] p-[22px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-[mc-rise_0.22s_ease_both]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-lg font-bold text-wood-deep m-0">新增分類</h2>
          <button
            className="border-none bg-transparent cursor-pointer text-ink-soft p-1"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-3">
          <label className="block text-xs font-semibold text-ink-soft mb-[5px]">分類名稱</label>
          <input
            className="w-full border border-panel-shadow bg-white rounded-[10px] px-3 py-[9px] text-sm font-sans text-ink outline-none focus:border-rose"
            type="text"
            autoFocus
            placeholder="例如：偶像團名、劇名"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
          />
        </div>

        {error && (
          <div className="mb-3 bg-[#fbe9e5] border border-[#e8b5a8] text-rose-deep text-[13px] px-3.5 py-2.5 rounded-[10px]">
            {error}
          </div>
        )}

        <div className="flex gap-2.5 mt-[18px]">
          <button
            className="flex-1 border-none rounded-[10px] p-2.5 text-sm font-semibold font-sans cursor-pointer bg-panel text-ink"
            onClick={onClose}
          >
            取消
          </button>
          <button
            className="flex-1 border-none rounded-[10px] p-2.5 text-sm font-semibold font-sans cursor-pointer text-white flex items-center justify-center gap-1.5 bg-[linear-gradient(155deg,var(--color-rose),var(--color-rose-deep))] disabled:opacity-60 disabled:cursor-default"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? (
              <Loader2 size={15} className="animate-[mc-spin_0.9s_linear_infinite]" />
            ) : (
              "新增分類"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
