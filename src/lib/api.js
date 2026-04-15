const DEFAULT_BASE_URL = "https://db.hafizhibnusyam.my.id";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_DRAMABOX_API_BASE_URL || DEFAULT_BASE_URL;

function toQueryString(params) {
  const entries = Object.entries(params || {}).filter(
    ([, v]) => v !== undefined && v !== null && v !== ""
  );
  if (!entries.length) return "";
  const qs = new URLSearchParams();
  for (const [k, v] of entries) qs.set(k, String(v));
  const s = qs.toString();
  return s ? `?${s}` : "";
}

async function fetchJson(path, { method = "GET", params, body, signal } = {}) {
  const url = `${API_BASE_URL}${path}${toQueryString(params)}`;
  const headers = {
    accept: "application/json",
  };

  if (body) {
    headers["content-type"] = "application/json";
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    signal,
    cache: "no-store",
  });

  let json = null;
  try {
    json = await res.json();
  } catch {
    // ignore
  }

  if (!res.ok) {
    const msg =
      json?.message ||
      (res.status === 422
        ? "Permintaan tidak valid. Silakan cek input pencarian."
        : "Gagal memuat data drama. Silakan coba lagi.");
    const error = new Error(msg);
    error.status = res.status;
    error.payload = json;
    throw error;
  }

  if (json?.success === false) {
    throw new Error(json?.message || "Gagal memuat data drama. Silakan coba lagi.");
  }

  return json;
}

export function normalizeDrama(item) {
  if (!item || typeof item !== "object") return null;
  return {
    id: item.id ? String(item.id) : undefined,
    title: item.title || "",
    cover_image: item.cover_image || "",
    introduction: item.introduction || "",
    tags: Array.isArray(item.tags) ? item.tags : [],
    episode_count:
      typeof item.episode_count === "number"
        ? item.episode_count
        : Number(item.episode_count) || 0,
  };
}

export function normalizeSources(streamUrlList) {
  const list = Array.isArray(streamUrlList) ? streamUrlList : [];
  return list
    .map((s) => ({
      quality: Number(s?.quality) || 0,
      url: s?.url || "",
    }))
    .filter((s) => s.quality && s.url)
    .sort((a, b) => b.quality - a.quality);
}

export async function getHiddenGems({ page = 1, signal } = {}) {
  const json = await fetchJson("/api/dramas/hidden-gems", {
    params: { page },
    signal,
  });

  return {
    items: Array.isArray(json?.data)
      ? json.data.map(normalizeDrama).filter(Boolean)
      : [],
    meta: json?.meta || null,
  };
}

export async function searchDramas({ keyword, page = 1, size = 20, signal } = {}) {
  const json = await fetchJson("/api/search", {
    params: { keyword, page, size },
    signal,
  });

  return {
    items: Array.isArray(json?.data)
      ? json.data.map(normalizeDrama).filter(Boolean)
      : [],
    meta: json?.meta || null,
  };
}

export async function getChapterVideo({ bookId, episode, signal } = {}) {
  const json = await fetchJson("/api/chapters/video", {
    method: "POST",
    params: { book_id: bookId, episode },
    body: null,
    signal,
  });

  const all = [
    ...(Array.isArray(json?.data) ? json.data : []),
    ...(Array.isArray(json?.extras) ? json.extras : []),
  ];
  const match =
    all.find((c) => String(c?.chapter_index) === String(episode)) || all[0];

  return {
    chapter: match || null,
    raw: json,
  };
}

// Best effort: beberapa drama mungkin tidak ada endpoint detail by ID.
// Fungsi ini mencoba menemukan drama lewat daftar hidden-gems (pagination).
export async function findDramaById(id, { maxPages = 5, signal } = {}) {
  if (!id) return null;
  let page = 1;
  let hasMore = true;

  while (hasMore && page <= maxPages) {
    const res = await getHiddenGems({ page, signal });
    const found = res.items.find((d) => String(d.id) === String(id));
    if (found) return found;

    const pagination = res?.meta?.pagination;
    hasMore = Boolean(pagination?.has_more);
    page += 1;
  }

  return null;
}
