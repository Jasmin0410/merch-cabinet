// 這個專案跑在你自己的瀏覽器環境（非 Claude.ai 沙盒），
// 所以資料改用瀏覽器內建的 localStorage 儲存，介面維持跟
// window.storage 類似，方便之後你想換成後端 API 或雲端資料庫時替換。

export const storage = {
  async get(key) {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return null;
      return { key, value: raw };
    } catch (e) {
      console.error("storage.get failed", e);
      return null;
    }
  },

  async set(key, value) {
    try {
      window.localStorage.setItem(key, value);
      return { key, value };
    } catch (e) {
      // 最常見原因：單一網域的 localStorage 容量已滿（通常 5-10MB）
      console.error("storage.set failed", e);
      return null;
    }
  },

  async delete(key) {
    try {
      window.localStorage.removeItem(key);
      return { key, deleted: true };
    } catch (e) {
      console.error("storage.delete failed", e);
      return null;
    }
  },
};
