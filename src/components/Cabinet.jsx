import { Archive, Loader2 } from "lucide-react";
import ItemCard from "./ItemCard.jsx";

export default function Cabinet({
  loading,
  filtered,
  hasAnyItems,
  isPhotoSearch,
  onAskDelete,
  onViewItem,
  bulkMode,
  selectedIds,
  onToggleSelect,
}) {
  return (
    <div className="max-w-[980px] mx-auto p-[10px] ">
      <div className="grid gap-3.5 grid-cols-[repeat(auto-fill,minmax(130px,1fr))] min-[481px]:grid-cols-[repeat(auto-fill,minmax(150px,1fr))]">
        {loading && (
          <div className="col-span-full flex items-center justify-center gap-2 text-white/85 py-[60px] text-sm">
            <Loader2 size={18} className="animate-[mc-spin_0.9s_linear_infinite]" />
            正在打開櫃子...
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="col-span-full text-center py-[50px] px-5 text-white/85">
            <Archive size={34} strokeWidth={1.3} />
            <p className="font-serif text-[17px] mt-3.5">
              {isPhotoSearch
                ? "找不到長得像的收藏"
                : hasAnyItems
                  ? "找不到符合的周邊"
                  : "櫃子還是空的"}
            </p>
            <p className="mt-2.5 text-sm">
              {isPhotoSearch
                ? "換個角度或光線再拍一次試試"
                : hasAnyItems
                  ? "換個關鍵字或標籤試試看"
                  : "點選「新增周邊」放入第一件收藏吧"}
            </p>
          </div>
        )}

        {!loading &&
          filtered.map((it) => (
            <ItemCard
              key={it.id}
              item={it}
              onAskDelete={onAskDelete}
              onView={onViewItem}
              bulkMode={bulkMode}
              selected={selectedIds?.has(it.id)}
              onToggleSelect={onToggleSelect}
            />
          ))}
      </div>
    </div>
  );
}
