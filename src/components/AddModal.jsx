import { useRef } from "react";
import { X, ImagePlus, Loader2 } from "lucide-react";
import { ALL_TAB } from "../constants.js";

const ADD_TAG_OPTION = "__add_tag__";

export default function AddModal({
  form,
  setForm,
  tags,
  saving,
  error,
  onClose,
  onFileSelected,
  onSave,
  onOpenAddTag,
}) {
  const fileInputRef = useRef(null);

  return (
    <div
      className="fixed inset-0 bg-ink/45 backdrop-blur-[2px] flex items-center justify-center p-5 z-50 animate-[mc-fade_0.18s_ease_both]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-wall rounded-[18px] w-full max-w-[380px] max-h-[90vh] overflow-y-auto p-[22px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-[mc-rise_0.22s_ease_both]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-lg font-bold text-wood-deep m-0">新增周邊</h2>
          <button
            className="border-none bg-transparent cursor-pointer text-ink-soft p-1"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

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
            onChange={(e) => onFileSelected(e.target.files?.[0])}
          />
        </div>

        <div className="mb-3">
          <label className="block text-xs font-semibold text-ink-soft mb-[5px]">名稱</label>
          <input
            className="w-full border border-panel-shadow bg-white rounded-[10px] px-3 py-[9px] text-sm font-sans text-ink outline-none focus:border-rose"
            type="text"
            placeholder="例如：東海健身小卡、SJ Market 抱枕"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>

        <div className="mb-3">
          <label className="block text-xs font-semibold text-ink-soft mb-[5px]">標籤分類</label>
          <select
            className="w-full border border-panel-shadow bg-white rounded-[10px] px-3 py-[9px] text-sm font-sans text-ink outline-none focus:border-rose"
            value={form.tag}
            onChange={(e) => {
              if (e.target.value === ADD_TAG_OPTION) {
                onOpenAddTag();
                return;
              }
              setForm((f) => ({ ...f, tag: e.target.value }));
            }}
          >
            <option value="">未分類</option>
            {tags
              .filter((t) => t !== ALL_TAB)
              .map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            <option value={ADD_TAG_OPTION}>+ 新增分類...</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="block text-xs font-semibold text-ink-soft mb-[5px]">價格（選填）</label>
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
            onClick={onSave}
            disabled={saving}
          >
            {saving ? (
              <Loader2 size={15} className="animate-[mc-spin_0.9s_linear_infinite]" />
            ) : (
              "收進櫃子"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
