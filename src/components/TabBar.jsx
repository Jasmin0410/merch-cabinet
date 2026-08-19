import { Plus } from "lucide-react";

export default function TabBar({ tags, activeTag, onSelect, onAddTag }) {
  return (
    <div className="max-w-[980px] mx-auto flex gap-1.5 overflow-x-auto px-1.5 [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1">
      {tags.map((t) => (
        <button
          key={t}
          className={`flex-shrink-0 border-none px-4 pt-[9px] pb-2.5 text-[13px] font-semibold font-sans rounded-t-[10px] cursor-pointer transition-[background,color,transform] duration-150 ease-in-out ${
            t === activeTag
              ? "bg-wood-mid text-[#fdf8f1] translate-y-px"
              : "text-wood-deep bg-white/55 hover:bg-white/85"
          }`}
          onClick={() => onSelect(t)}
        >
          {t}
        </button>
      ))}
      <button
        className="flex-shrink-0 flex items-center gap-1 border-none px-3 pt-[9px] pb-2.5 text-[13px] font-semibold font-sans rounded-t-[10px] cursor-pointer text-ink-soft bg-white/30 hover:bg-white/60 hover:text-wood-deep transition-[background,color] duration-150 ease-in-out"
        onClick={onAddTag}
        aria-label="新增分類"
      >
        <Plus size={13} strokeWidth={2.5} />
      </button>
    </div>
  );
}
