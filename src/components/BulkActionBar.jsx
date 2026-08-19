import { Trash2 } from "lucide-react";
import { ALL_TAB } from "../constants.js";

const ADD_TAG_OPTION = "__add_tag__";

export default function BulkActionBar({ count, tags, onApplyTag, onOpenAddTag, onRequestDelete }) {
  return (
    <div className="fixed bottom-24 left-4 right-4 z-40 flex justify-center pointer-events-none">
      <div className="pointer-events-auto bg-wood-deep text-[#fdf8f1] rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.35)] px-4 py-3 flex items-center gap-2.5 max-w-[440px] w-full animate-[mc-rise_0.22s_ease_both]">
        <span className="text-sm font-semibold flex-shrink-0">已選擇 {count} 件</span>
        <select
          className="flex-1 min-w-0 border-none rounded-lg px-2.5 py-1.5 text-xs font-sans bg-white/15 text-[#fdf8f1] outline-none"
          value=""
          onChange={(e) => {
            if (e.target.value === ADD_TAG_OPTION) {
              onOpenAddTag();
              return;
            }
            if (e.target.value) onApplyTag(e.target.value);
          }}
        >
          <option value="" disabled>
            加入分類...
          </option>
          {tags
            .filter((t) => t !== ALL_TAB)
            .map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          <option value={ADD_TAG_OPTION}>+ 新增分類...</option>
        </select>
        <button
          className="border-none rounded-lg p-1.5 cursor-pointer bg-white/15 text-[#fdf8f1] hover:bg-rose flex-shrink-0"
          onClick={onRequestDelete}
          aria-label="批量刪除"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
