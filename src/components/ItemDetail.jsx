import { useRef, useState } from "react";
import { ImagePlus, Loader2, Pencil } from "lucide-react";
import { UNTAGGED, ALL_TAB } from "../constants.js";
import { compressImage } from "../utils/image.js";

function InfoRow({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-2 border-b border-panel-shadow last:border-b-0">
      <span className="text-xs font-semibold text-ink-soft flex-shrink-0">{label}</span>
      <span className="text-sm text-ink text-right break-words whitespace-pre-wrap">{value}</span>
    </div>
  );
}

function formToEdit(item) {
  return {
    photoPreview: item.photo,
    name: item.name,
    tag: item.tag || "",
    price: typeof item.price === "number" ? String(item.price) : "",
    note: item.note || "",
  };
}

export default function ItemDetail({ item, tags, onClose, onSave }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(() => formToEdit(item));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  if (!item) return null;

  const startEditing = () => {
    setForm(formToEdit(item));
    setError("");
    setEditing(true);
  };

  const cancelEditing = () => {
    setError("");
    setEditing(false);
  };

  const handleFileSelected = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("請選擇圖片檔案");
      return;
    }
    try {
      const compressed = await compressImage(file);
      setForm((f) => ({ ...f, photoPreview: compressed }));
      setError("");
    } catch {
      setError("圖片讀取失敗，請換一張試試");
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError("請輸入名稱");
      return;
    }
    setSaving(true);
    const result = await onSave(item.id, {
      name: form.name,
      tag: form.tag,
      price: form.price,
      note: form.note,
      photo: form.photoPreview,
    });
    setSaving(false);
    if (result) {
      setError(result);
      return;
    }
    setEditing(false);
  };

  return (
    <div
      className="fixed inset-0 bg-ink/45 backdrop-blur-[2px] flex items-center justify-center p-5 z-50 animate-[mc-fade_0.18s_ease_both]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-wall rounded-[18px] w-full max-w-[380px] max-h-[90vh] overflow-y-auto p-[22px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-[mc-rise_0.22s_ease_both]">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="font-serif text-lg font-bold text-wood-deep m-0 break-words">
            {editing ? "編輯收藏" : item.name}
          </h2>
          <div className="flex items-center gap-1 flex-shrink-0">
            {!editing && (
              <button
                className="border-none bg-transparent cursor-pointer text-ink-soft p-1 hover:text-rose"
                onClick={startEditing}
                aria-label="編輯"
              >
                <Pencil size={18} />
              </button>
            )}
          </div>
        </div>

        {editing ? (
          <>
            <div
              className="w-[80%] mx-auto aspect-square rounded-xl border-2 border-dashed border-panel-shadow bg-panel flex flex-col items-center justify-center gap-1.5 cursor-pointer overflow-hidden relative mb-3.5 transition-[border-color] duration-150 ease-in-out hover:border-rose"
              onClick={() => fileInputRef.current?.click()}
            >
              {form.photoPreview ? (
                <img src={form.photoPreview} alt="預覽" className="w-full h-full object-cover" />
              ) : (
                <>
                  <ImagePlus size={26} color="#a89686" strokeWidth={1.5} />
                  <span className="text-ink-soft text-xs">點擊上傳照片</span>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileSelected(e.target.files?.[0])}
              />
            </div>

            <div className="mb-3">
              <label className="block text-xs font-semibold text-ink-soft mb-[5px]">名稱</label>
              <input
                className="w-full border border-panel-shadow bg-white rounded-[10px] px-3 py-[9px] text-sm font-sans text-ink outline-none focus:border-rose"
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div className="mb-3">
              <label className="block text-xs font-semibold text-ink-soft mb-[5px]">標籤分類</label>
              <select
                className="w-full border border-panel-shadow bg-white rounded-[10px] px-3 py-[9px] text-sm font-sans text-ink outline-none focus:border-rose"
                value={form.tag}
                onChange={(e) => setForm((f) => ({ ...f, tag: e.target.value }))}
              >
                <option value="">未分類</option>
                {tags
                  .filter((t) => t !== ALL_TAB)
                  .map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="block text-xs font-semibold text-ink-soft mb-[5px]">
                價格（選填）
              </label>
              <input
                className="w-full border border-panel-shadow bg-white rounded-[10px] px-3 py-[9px] text-sm font-sans text-ink outline-none focus:border-rose"
                type="number"
                min="0"
                inputMode="numeric"
                placeholder="例如：350"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              />
            </div>

            <div className="mb-3">
              <label className="block text-xs font-semibold text-ink-soft mb-[5px]">
                備註（選填）
              </label>
              <textarea
                className="w-full border border-panel-shadow bg-white rounded-[10px] px-3 py-[9px] text-sm font-sans text-ink outline-none focus:border-rose resize-none"
                rows={2}
                placeholder="例如：閒魚代購、限定色"
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
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
                onClick={cancelEditing}
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
                  "儲存"
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-white shadow-[0_2px_5px_rgba(0,0,0,0.15)] mb-4">
              <img src={item.photo} alt={item.name} className="w-full h-full object-cover block" />
              <span className="absolute top-1.5 left-1.5 bg-ink/60 text-[#fdf8f1] text-[10px] font-semibold px-2 py-[3px] rounded-full backdrop-blur-[2px]">
                {item.tag || UNTAGGED}
              </span>
            </div>

            <div className="mb-4">
              <InfoRow label="標籤分類" value={item.tag || UNTAGGED} />
              <InfoRow
                label="價格"
                value={typeof item.price === "number" ? `$${item.price}` : "-"}
              />
              <InfoRow label="備註" value={item.note || "-"} />
            </div>

            <button
              className="w-full border-none rounded-[10px] p-2.5 text-sm font-semibold font-sans cursor-pointer bg-panel text-ink"
              onClick={onClose}
            >
              關閉
            </button>
          </>
        )}
      </div>
    </div>
  );
}
