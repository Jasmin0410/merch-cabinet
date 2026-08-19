import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Pencil, X } from "lucide-react";
import Header from "./components/Header.jsx";
import Toolbar from "./components/Toolbar.jsx";
import TabBar from "./components/TabBar.jsx";
import Cabinet from "./components/Cabinet.jsx";
import AddModal from "./components/AddModal.jsx";
import AddTag from "./components/AddTag.jsx";
import ItemDetail from "./components/ItemDetail.jsx";
import BulkActionBar from "./components/BulkActionBar.jsx";
import ConfirmDialog from "./components/ConfirmDialog.jsx";
import Toast from "./components/Toast.jsx";
import { storage } from "./storage.js";
import { compressImage } from "./utils/image.js";
import {
  computeImageHash,
  hammingDistance,
  similarityPercent,
  readFileAsDataURL,
  PHASH_MATCH_THRESHOLD,
} from "./utils/phash.js";
import { downloadJSON, readJSONFile } from "./utils/backup.js";
import { STORAGE_KEY, TAGS_STORAGE_KEY, UNTAGGED, ALL_TAB } from "./constants.js";

const EMPTY_FORM = { photoPreview: null, name: "", date: "", tag: "", price: "", note: "" };

export default function App() {
  const [items, setItems] = useState([]);
  const [customTags, setCustomTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState(ALL_TAB);

  const [showAddTagModal, setShowAddTagModal] = useState(false);
  const [addingTag, setAddingTag] = useState(false);
  const [addTagTarget, setAddTagTarget] = useState("form");

  const [photoQuery, setPhotoQuery] = useState(null); // { hash, preview }
  const [photoSearching, setPhotoSearching] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
  const [confirmingBulkDelete, setConfirmingBulkDelete] = useState(false);
  const [viewingItem, setViewingItem] = useState(null);

  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());

  const [toast, setToast] = useState("");
  const toastTimerRef = useRef(null);
  const showToast = (message) => {
    clearTimeout(toastTimerRef.current);
    setToast(message);
    toastTimerRef.current = setTimeout(() => setToast(""), 2500);
  };

  // 初次載入：讀取已儲存的收藏與分類
  useEffect(() => {
    (async () => {
      try {
        const [itemsRes, tagsRes] = await Promise.all([
          storage.get(STORAGE_KEY),
          storage.get(TAGS_STORAGE_KEY),
        ]);
        if (itemsRes && itemsRes.value) {
          setItems(JSON.parse(itemsRes.value));
        }
        if (tagsRes && tagsRes.value) {
          setCustomTags(JSON.parse(tagsRes.value));
        }
      } catch {
        // 尚無資料，維持空陣列
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = useCallback(async (next) => {
    const result = await storage.set(STORAGE_KEY, JSON.stringify(next));
    if (!result) {
      setError("儲存空間可能已滿，請試著刪除一些較大的照片後再試一次。");
      return false;
    }
    return true;
  }, []);

  const persistTags = useCallback(async (next) => {
    const result = await storage.set(TAGS_STORAGE_KEY, JSON.stringify(next));
    return !!result;
  }, []);

  // 補算舊資料的圖片指紋（拍照搜尋用），載入完成後只安靜地跑一次
  const migratedRef = useRef(false);
  useEffect(() => {
    if (loading || migratedRef.current) return;
    migratedRef.current = true;
    const missing = items.filter((it) => !it.phash);
    if (missing.length === 0) return;
    (async () => {
      const withHashes = await Promise.all(
        items.map(async (it) => {
          if (it.phash) return it;
          try {
            return { ...it, phash: await computeImageHash(it.photo) };
          } catch {
            return it;
          }
        }),
      );
      setItems(withHashes);
      await persist(withHashes);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const openAddForm = () => {
    setForm(EMPTY_FORM);
    setError("");
    setShowForm(true);
  };

  const closeAddForm = () => setShowForm(false);

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

  const handleSave = async () => {
    if (!form.photoPreview) {
      setError("請上傳一張照片");
      return;
    }
    if (!form.name.trim()) {
      setError("請輸入名稱");
      return;
    }
    setSaving(true);
    const newItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: form.name.trim(),
      date: form.date || "",
      tag: form.tag.trim() || UNTAGGED,
      price: form.price.trim() ? Number(form.price) : null,
      note: form.note.trim(),
      photo: form.photoPreview,
      phash: await computeImageHash(form.photoPreview).catch(() => null),
      createdAt: Date.now(),
    };
    const next = [newItem, ...items];
    const ok = await persist(next);
    setSaving(false);
    if (ok) {
      setItems(next);
      setShowForm(false);
      setForm(EMPTY_FORM);
    }
  };

  const handleUpdateItem = async (id, updates) => {
    if (!updates.name.trim()) return "請輸入名稱";
    const current = items.find((it) => it.id === id);
    if (!current) return "找不到這件收藏";

    const photoChanged = updates.photo && updates.photo !== current.photo;
    const updatedItem = {
      ...current,
      name: updates.name.trim(),
      tag: updates.tag.trim() || UNTAGGED,
      price: updates.price.trim() ? Number(updates.price) : null,
      note: updates.note.trim(),
      photo: updates.photo || current.photo,
      phash: photoChanged ? await computeImageHash(updates.photo).catch(() => null) : current.phash,
    };
    const next = items.map((it) => (it.id === id ? updatedItem : it));
    const ok = await persist(next);
    if (!ok) return "儲存失敗，請再試一次";
    setItems(next);
    setViewingItem(updatedItem);
    return null;
  };

  const handleDelete = async (id) => {
    const next = items.filter((it) => it.id !== id);
    const ok = await persist(next);
    if (ok) {
      setItems(next);
      setConfirmDeleteItem(null);
    }
  };

  const toggleBulkMode = () => {
    setBulkMode((v) => !v);
    setSelectedIds(new Set());
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkApplyTag = async (tag) => {
    if (!tag || selectedIds.size === 0) return;
    const count = selectedIds.size;
    const next = items.map((it) => (selectedIds.has(it.id) ? { ...it, tag } : it));
    const ok = await persist(next);
    if (ok) {
      setItems(next);
      setSelectedIds(new Set());
      showToast(`已將 ${count} 件收藏加入「${tag}」分類`);
    }
  };

  const handleBulkDelete = async () => {
    const next = items.filter((it) => !selectedIds.has(it.id));
    const ok = await persist(next);
    if (ok) {
      setItems(next);
      setSelectedIds(new Set());
    }
    setConfirmingBulkDelete(false);
  };

  const handleExport = () => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      items,
      tags: customTags,
    };
    const date = new Date().toISOString().slice(0, 10);
    downloadJSON(data, `周邊整理櫃-備份-${date}.json`);
  };

  const handleImportFile = async (file) => {
    if (!file) return;
    let data;
    try {
      data = await readJSONFile(file);
    } catch {
      setError("檔案讀取失敗，請確認是有效的 JSON 檔案");
      return;
    }
    if (!data || !Array.isArray(data.items)) {
      setError("檔案格式不正確，找不到收藏資料");
      return;
    }

    const existingIds = new Set(items.map((it) => it.id));
    const validItems = data.items.filter(
      (it) => it && typeof it.name === "string" && typeof it.photo === "string",
    );
    const importedItems = await Promise.all(
      validItems.map(async (it) => {
        const id =
          !it.id || existingIds.has(it.id)
            ? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
            : it.id;
        existingIds.add(id);
        const phash = it.phash || (await computeImageHash(it.photo).catch(() => null));
        return { ...it, id, phash };
      }),
    );

    const tagSet = new Set(customTags);
    if (Array.isArray(data.tags)) {
      data.tags.forEach((t) => {
        if (typeof t === "string" && t.trim()) tagSet.add(t.trim());
      });
    }

    const nextItems = [...importedItems, ...items];
    const nextTags = Array.from(tagSet);
    const [itemsOk, tagsOk] = await Promise.all([persist(nextItems), persistTags(nextTags)]);
    if (!itemsOk || !tagsOk) {
      setError("匯入失敗，請再試一次");
      return;
    }
    setItems(nextItems);
    setCustomTags(nextTags);
    setError("");
    showToast(`已匯入 ${importedItems.length} 件收藏`);
  };

  const handleQueryChange = (value) => {
    setQuery(value);
    if (value) setPhotoQuery(null);
  };

  const handlePhotoSearch = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("請選擇圖片檔案");
      return;
    }
    setPhotoSearching(true);
    setError("");
    try {
      const dataUrl = await readFileAsDataURL(file);
      const hash = await computeImageHash(dataUrl);
      setQuery("");
      setPhotoQuery({ hash, preview: dataUrl });
    } catch {
      setError("照片讀取失敗，請換一張試試");
    } finally {
      setPhotoSearching(false);
    }
  };

  const clearPhotoSearch = () => setPhotoQuery(null);

  const openAddTagModal = (target = "form") => {
    setAddTagTarget(target);
    setShowAddTagModal(true);
  };
  const closeAddTagModal = () => setShowAddTagModal(false);

  const handleAddTag = async (name) => {
    const trimmed = name.trim();
    if (!trimmed) return "請輸入分類名稱";
    if (trimmed === ALL_TAB) return "這個名稱是保留字，換一個吧";
    const isDuplicate = tags.some((t) => t.toLowerCase() === trimmed.toLowerCase());
    if (isDuplicate) return "這個分類已經存在了";
    setAddingTag(true);
    const next = [...customTags, trimmed];
    const ok = await persistTags(next);
    setAddingTag(false);
    if (!ok) return "儲存分類失敗，請再試一次";
    setCustomTags(next);
    if (addTagTarget === "bulk") {
      showToast(`新分類「${trimmed}」已新增，請選擇要加入的分類`);
    } else {
      setForm((f) => ({ ...f, tag: trimmed }));
    }
    setShowAddTagModal(false);
    return null;
  };

  const tags = useMemo(() => {
    const set = new Set(customTags);
    items.forEach((it) => set.add(it.tag || UNTAGGED));
    return [ALL_TAB, ...Array.from(set).sort((a, b) => a.localeCompare(b, "zh-Hant"))];
  }, [items, customTags]);

  useEffect(() => {
    if (activeTag !== ALL_TAB && !tags.includes(activeTag)) {
      setActiveTag(ALL_TAB);
    }
  }, [tags, activeTag]);

  const byTag =
    activeTag === ALL_TAB ? items : items.filter((it) => (it.tag || UNTAGGED) === activeTag);

  const filtered = useMemo(() => {
    if (photoQuery) {
      return byTag
        .map((it) => ({ it, distance: hammingDistance(it.phash, photoQuery.hash) }))
        .filter(({ distance }) => distance <= PHASH_MATCH_THRESHOLD)
        .sort((a, b) => a.distance - b.distance)
        .map(({ it, distance }) => ({ ...it, similarity: similarityPercent(distance) }));
    }
    return query.trim()
      ? byTag.filter((it) => it.name.toLowerCase().includes(query.trim().toLowerCase()))
      : byTag;
  }, [byTag, query, photoQuery]);

  return (
    <div className="min-h-screen px-5 pt-7 pb-[60px] text-ink font-sans bg-wall bg-[radial-gradient(circle_at_15%_10%,rgba(255,255,255,0.5),transparent_40%),radial-gradient(circle_at_85%_90%,rgba(139,98,72,0.08),transparent_45%)]">
      <Header
        loading={loading}
        count={items.length}
        onExport={handleExport}
        onImportFile={handleImportFile}
      />

      <Toolbar
        query={query}
        onQueryChange={handleQueryChange}
        onAddClick={openAddForm}
        photoQuery={photoQuery}
        photoSearching={photoSearching}
        onPhotoSelected={handlePhotoSearch}
        onClearPhotoSearch={clearPhotoSearch}
      />

      {!loading && (items.length > 0 || tags.length > 1) && (
        <TabBar
          tags={tags}
          activeTag={activeTag}
          onSelect={setActiveTag}
          onAddTag={openAddTagModal}
        />
      )}

      {error && !showForm && (
        <div className="max-w-[980px] mx-auto mb-4 bg-[#fbe9e5] border border-[#e8b5a8] text-rose-deep text-[13px] px-3.5 py-2.5 rounded-[10px]">
          {error}
        </div>
      )}

      <Cabinet
        loading={loading}
        filtered={filtered}
        hasAnyItems={items.length > 0}
        isPhotoSearch={!!photoQuery}
        onAskDelete={setConfirmDeleteItem}
        onViewItem={setViewingItem}
        bulkMode={bulkMode}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
      />

      {!loading && items.length > 0 && (
        <button
          className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full border-none flex items-center justify-center cursor-pointer shadow-[0_6px_20px_rgba(0,0,0,0.3)] transition-[background,transform] duration-150 ease-in-out hover:scale-105 ${
            bulkMode
              ? "bg-rose text-white"
              : "bg-[linear-gradient(155deg,var(--color-wood-mid),var(--color-wood-deep))] text-[#fdf8f1]"
          }`}
          onClick={toggleBulkMode}
          aria-label={bulkMode ? "結束批量編輯" : "批量編輯"}
        >
          {bulkMode ? <X size={22} /> : <Pencil size={20} />}
        </button>
      )}

      {bulkMode && selectedIds.size > 0 && (
        <BulkActionBar
          count={selectedIds.size}
          tags={tags}
          onApplyTag={handleBulkApplyTag}
          onOpenAddTag={() => openAddTagModal("bulk")}
          onRequestDelete={() => setConfirmingBulkDelete(true)}
        />
      )}

      {confirmDeleteItem && (
        <ConfirmDialog
          title="刪除收藏"
          message={`確定要刪除「${confirmDeleteItem.name}」這件收藏嗎？此操作無法復原。`}
          confirmLabel="刪除"
          danger
          onCancel={() => setConfirmDeleteItem(null)}
          onConfirm={() => handleDelete(confirmDeleteItem.id)}
        />
      )}

      {confirmingBulkDelete && (
        <ConfirmDialog
          title="批量刪除"
          message={`確定要刪除 ${selectedIds.size} 件收藏嗎？此操作無法復原。`}
          confirmLabel="確定刪除"
          danger
          onCancel={() => setConfirmingBulkDelete(false)}
          onConfirm={handleBulkDelete}
        />
      )}

      <Toast message={toast} />

      {viewingItem && (
        <ItemDetail
          item={viewingItem}
          tags={tags}
          onClose={() => setViewingItem(null)}
          onSave={handleUpdateItem}
        />
      )}

      {showForm && (
        <AddModal
          form={form}
          setForm={setForm}
          tags={tags}
          saving={saving}
          error={error}
          onClose={closeAddForm}
          onFileSelected={handleFileSelected}
          onSave={handleSave}
          onOpenAddTag={openAddTagModal}
        />
      )}

      {showAddTagModal && (
        <AddTag saving={addingTag} onClose={closeAddTagModal} onAdd={handleAddTag} />
      )}
    </div>
  );
}
