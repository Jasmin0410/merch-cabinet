import { useRef } from "react";
import { Archive, Download, Upload } from "lucide-react";

export default function Header({ loading, count, onExport, onImportFile }) {
  const importInputRef = useRef(null);

  return (
    <div className="max-w-[980px] mx-auto mb-[22px] flex items-end justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-[10px] flex items-center justify-center flex-shrink-0 shadow-[0_3px_0_rgba(0,0,0,0.15),0_6px_14px_rgba(90,60,40,0.25)] bg-[linear-gradient(155deg,var(--color-wood-mid),var(--color-wood-deep))]">
          <Archive size={22} color="#f4ece1" strokeWidth={1.8} />
        </div>
        <div>
          <h1 className="font-serif font-bold text-[22px] min-[481px]:text-[26px] tracking-[0.02em] m-0 text-wood-deep">
            周邊整理櫃
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="border border-panel-shadow bg-white rounded-full p-2 cursor-pointer text-ink-soft hover:text-rose hover:border-rose transition-colors duration-150 ease-in-out"
          onClick={onExport}
          aria-label="匯出 JSON"
          title="匯出 JSON"
        >
          <Download size={15} />
        </button>
        <button
          className="border border-panel-shadow bg-white rounded-full p-2 cursor-pointer text-ink-soft hover:text-rose hover:border-rose transition-colors duration-150 ease-in-out"
          onClick={() => importInputRef.current?.click()}
          aria-label="匯入 JSON"
          title="匯入 JSON"
        >
          <Upload size={15} />
        </button>
        <input
          ref={importInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            onImportFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />

        {!loading && (
          <div className="text-[13px] text-ink-soft bg-panel px-3 py-[5px] rounded-full border border-panel-shadow">
            共 {count} 件收藏
          </div>
        )}
      </div>
    </div>
  );
}
