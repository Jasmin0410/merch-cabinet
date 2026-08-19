// dHash（差異雜湊）：把圖片縮成 9x8 灰階格線，比較每列相鄰像素亮度，
// 產生 64 位元指紋。兩張圖越像，指紋的漢明距離（不同位元數）就越小。
const HASH_W = 9;
const HASH_H = 8;

export const PHASH_MATCH_THRESHOLD = 26; // 64 位元中容許的最大差異位元數

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function computeImageHash(src) {
  const img = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = HASH_W;
  canvas.height = HASH_H;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, HASH_W, HASH_H);
  const { data } = ctx.getImageData(0, 0, HASH_W, HASH_H);

  const gray = [];
  for (let i = 0; i < data.length; i += 4) {
    gray.push(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
  }

  let hash = "";
  for (let row = 0; row < HASH_H; row++) {
    for (let col = 0; col < HASH_W - 1; col++) {
      const left = gray[row * HASH_W + col];
      const right = gray[row * HASH_W + col + 1];
      hash += left > right ? "1" : "0";
    }
  }
  return hash;
}

export function hammingDistance(a, b) {
  if (!a || !b || a.length !== b.length) return Infinity;
  let dist = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) dist++;
  }
  return dist;
}

export function similarityPercent(distance) {
  return Math.round((1 - distance / (HASH_W - 1) / HASH_H) * 100);
}

export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
