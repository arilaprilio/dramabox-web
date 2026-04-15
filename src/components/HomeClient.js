"use client";

import { useEffect, useMemo, useState } from "react";

import DramaGrid from "@/components/DramaGrid";
import ErrorState from "@/components/ErrorState";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import SearchBar from "@/components/SearchBar";
import EmptyState from "@/components/EmptyState";
import { getHiddenGems, searchDramas } from "@/lib/api";

export default function HomeClient() {
  const [mode, setMode] = useState("hidden"); // hidden | search
  const [query, setQuery] = useState("");

  const [dramas, setDramas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const title = useMemo(() => {
    if (mode === "search") return `Hasil pencarian: “${query}”`;
    return "Hidden Gems";
  }, [mode, query]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const res = await getHiddenGems({ page: 1, signal: controller.signal });
        setMode("hidden");
        setDramas(res.items);
      } catch (err) {
        setError(err?.message || "Gagal memuat data drama. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  async function handleSearchSubmit() {
    const trimmed = query.trim();
    if (!trimmed) {
      setMode("hidden");
      setLoading(true);
      setError(null);
      try {
        const res = await getHiddenGems({ page: 1 });
        setDramas(res.items);
      } catch (err) {
        setError(err?.message || "Gagal memuat data drama. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
      return;
    }

    setMode("search");
    setLoading(true);
    setError(null);

    try {
      const res = await searchDramas({ keyword: trimmed, page: 1, size: 20 });
      setDramas(res.items);
    } catch (err) {
      setError(err?.message || "Gagal memuat data drama. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-border bg-surface p-6 sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(96,165,250,0.20),transparent_45%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.14),transparent_45%),radial-gradient(circle_at_60%_80%,rgba(37,99,235,0.10),transparent_55%)]" />
        <div className="relative space-y-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              DramaBox
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
              Cari drama favoritmu, lihat detail & daftar episode, lalu tonton dengan pilihan resolusi.
            </p>
          </div>

          <SearchBar
            value={query}
            onChange={setQuery}
            onSubmit={handleSearchSubmit}
            isLoading={loading && mode === "search"}
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">{title}</h2>
          {mode === "search" ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setMode("hidden");
                setLoading(true);
                setError(null);
                getHiddenGems({ page: 1 })
                  .then((res) => setDramas(res.items))
                  .catch((err) =>
                    setError(
                      err?.message || "Gagal memuat data drama. Silakan coba lagi."
                    )
                  )
                  .finally(() => setLoading(false));
              }}
              className="rounded-full border border-border bg-surface px-4 py-2 text-sm text-foreground/90 hover:bg-surface-2"
            >
              Kembali ke Hidden Gems
            </button>
          ) : null}
        </div>

        {loading ? (
          <LoadingSkeleton variant="grid" />
        ) : error ? (
          <ErrorState message={error} onRetry={() => window.location.reload()} />
        ) : dramas.length ? (
          <DramaGrid dramas={dramas} />
        ) : (
          <EmptyState title="Drama tidak ditemukan." description="Coba kata kunci lain." />
        )}
      </section>
    </div>
  );
}
