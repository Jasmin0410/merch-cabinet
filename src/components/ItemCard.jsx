import { Trash2, Check } from "lucide-react";
import { formatDate } from "../utils/format.js";
import { UNTAGGED } from "../constants.js";

export default function ItemCard({
  item,
  onAskDelete,
  onView,
  bulkMode,
  selected,
  onToggleSelect,
}) {
  return (
    <div
      className={`group relative bg-panel rounded-md p-2.5 shadow-[inset_0_0_0_1px_var(--color-panel-shadow),inset_0_6px_14px_rgba(90,60,40,0.12)] animate-[mc-pop_0.35s_ease_both] ${
        bulkMode ? "cursor-pointer" : ""
      } ${selected ? "ring-2 ring-rose ring-offset-2 ring-offset-wood-mid" : ""}`}
      onClick={bulkMode ? () => onToggleSelect(item.id) : undefined}
    >
      {bulkMode && (
        <div className="flex justify-start mb-1.5">
          <span
            className={`w-[22px] h-[22px] rounded-full flex items-center justify-center border-2 ${
              selected ? "bg-rose border-rose" : "bg-white border-panel-shadow"
            }`}
          >
            {selected && <Check size={14} strokeWidth={3} color="#fff" />}
          </span>
        </div>
      )}
      <div className="relative aspect-square rounded-sm overflow-hidden bg-white shadow-[0_2px_5px_rgba(0,0,0,0.15)] mb-5">
        <img src={item.photo} alt={item.name} className="w-full h-full object-cover block" />
        <span className="absolute top-1.5 left-1.5 bg-ink/60 text-[#fdf8f1] text-[10px] font-semibold px-2 py-[3px] rounded-full backdrop-blur-[2px]">
          {item.tag || UNTAGGED}
        </span>
        {typeof item.similarity === "number" && (
          <span className="absolute bottom-1.5 right-1.5 bg-rose/85 text-white text-[10px] font-semibold px-2 py-[3px] rounded-full backdrop-blur-[2px]">
            {item.similarity}% 相似
          </span>
        )}
      </div>

      {bulkMode ? (
        <div
          className="text-[13px] font-semibold text-ink leading-[1.35] mx-0.5 my-0 break-words"
          title={item.note || undefined}
        >
          {item.name}
        </div>
      ) : (
        <button
          type="button"
          className="block w-full text-left border-none bg-transparent p-0 cursor-pointer text-[13px] font-semibold font-sans text-ink leading-[1.35] mx-0.5 my-0 break-words hover:text-rose-deep hover:underline"
          title={item.note || undefined}
          onClick={() => onView(item)}
        >
          {item.name}
        </button>
      )}
      {(item.date || typeof item.price === "number") && (
        <div className="flex items-center justify-between gap-1.5 mx-0.5 mt-[3px]">
          {item.date && (
            <span className="text-[11px] text-ink-soft [font-variant-numeric:tabular-nums]">
              {formatDate(item.date)}
            </span>
          )}
          {typeof item.price === "number" && (
            <span className="text-[11px] font-semibold text-rose-deep [font-variant-numeric:tabular-nums]">
              ${item.price}
            </span>
          )}
        </div>
      )}

      {!bulkMode && (
        <button
          className="absolute top-4 right-4 w-[26px] h-[26px] rounded-full border-none bg-ink/55 text-white flex items-center justify-center cursor-pointer opacity-0 transition-[opacity,background] duration-150 ease-in-out group-hover:opacity-100 hover:bg-rose-deep"
          onClick={() => onAskDelete(item)}
          aria-label="刪除"
        >
          <Trash2 size={13} />
        </button>
      )}
    </div>
  );
}
