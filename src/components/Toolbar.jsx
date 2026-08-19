import { useRef } from "react";
import { Search, Plus, Camera, X, Loader2 } from "lucide-react";

export default function Toolbar({
  query,
  onQueryChange,
  onAddClick,
  photoQuery,
  photoSearching,
  onPhotoSelected,
  onClearPhotoSearch,
}) {
  const photoInputRef = useRef(null);

  return (
    <div className="max-w-[980px] mx-auto mb-5 flex gap-2.5 flex-col">
      <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-white border border-panel-shadow rounded-xl px-3.5 py-2.5 shadow-[inset_0_1px_3px_rgba(90,60,40,0.06)]">
        {photoQuery ? (
          <>
            <img
              src={photoQuery.preview}
              alt="搜尋照片"
              className="w-6 h-6 rounded-md object-cover flex-shrink-0"
            />
            <span className="text-sm text-ink flex-1 truncate">以圖搜尋中...</span>
            <button
              className="border-none bg-transparent cursor-pointer text-ink-soft p-0.5 flex-shrink-0"
              onClick={onClearPhotoSearch}
              aria-label="清除照片搜尋"
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <>
            <Search size={16} className="text-[#a89686] flex-shrink-0" />
            <input
              type="text"
              placeholder="輸入周邊名稱或以圖搜圖..."
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              className="border-none outline-none bg-transparent text-sm font-sans w-full text-ink placeholder:text-[#b3a495]"
            />
          </>
        )}
        <button
          className="border-none bg-transparent cursor-pointer text-[#a89686] p-0.5 flex-shrink-0 hover:text-rose"
          onClick={() => photoInputRef.current?.click()}
          disabled={photoSearching}
          aria-label="拍照搜尋"
        >
          {photoSearching ? (
            <Loader2 size={17} className="animate-[mc-spin_0.9s_linear_infinite]" />
          ) : (
            <Camera size={17} />
          )}
        </button>
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            onPhotoSelected(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
      <div className="flex flex-1 justify-end">
        <button
          className="flex items-end gap-1.5 text-white border-none rounded-xl px-[18px] py-2.5 text-sm font-semibold font-sans cursor-pointer shadow-[0_2px_0_rgba(0,0,0,0.12),0_6px_14px_rgba(193,123,107,0.35)] transition-[transform,box-shadow] duration-150 ease-in-out hover:-translate-y-px hover:shadow-[0_3px_0_rgba(0,0,0,0.12),0_8px_18px_rgba(193,123,107,0.4)] active:translate-y-0 bg-[linear-gradient(155deg,var(--color-rose),var(--color-rose-deep))]"
          onClick={onAddClick}
        >
          <Plus size={17} strokeWidth={2.5} />
          新增周邊
        </button>
      </div>
    </div>
  );
}
