"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import EpisodeList from "@/components/EpisodeList";
import ErrorState from "@/components/ErrorState";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import VideoPlayer from "@/components/VideoPlayer";
import EmptyState from "@/components/EmptyState";
import {
  findDramaById,
  getChapterVideo,
  normalizeDrama,
  normalizeSources,
} from "@/lib/api";

export default function DramaDetailClient({ id, initialDrama }) {
  const [drama, setDrama] = useState(() => normalizeDrama(initialDrama));
  const [loadingDrama, setLoadingDrama] = useState(true);
  const [dramaError, setDramaError] = useState(null);

  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [videoError, setVideoError] = useState(null);
  const [sources, setSources] = useState([]);

  const episodeCount = drama?.episode_count || 0;
  const episodes = useMemo(() => {
    if (!episodeCount || episodeCount < 1) return [];
    return Array.from({ length: episodeCount }, (_, i) => i + 1);
  }, [episodeCount]);

  useEffect(() => {
    if (!id) return;

    // Jika data awal sudah ada (dari klik card), tidak perlu scan hidden-gems.
    if (initialDrama?.title) {
      setLoadingDrama(false);
      return;
    }

    const controller = new AbortController();
    setLoadingDrama(true);
    setDramaError(null);

    (async () => {
      try {
        const found = await findDramaById(id, { signal: controller.signal });
        if (found) setDrama(found);
      } catch (err) {
        setDramaError(
          err?.message || "Gagal memuat data drama. Silakan coba lagi."
        );
      } finally {
        setLoadingDrama(false);
      }
    })();

    return () => controller.abort();
  }, [id, initialDrama?.title]);

  async function handleSelectEpisode(episode) {
    setSelectedEpisode(episode);
    setLoadingVideo(true);
    setVideoError(null);
    setSources([]);

    try {
      const res = await getChapterVideo({ bookId: id, episode });
      const chapter = res?.chapter;
      const normalized = normalizeSources(chapter?.stream_url);
      if (!normalized.length) {
        setVideoError("Video tidak tersedia untuk episode ini.");
      }
      setSources(normalized);
    } catch (err) {
      setVideoError(err?.message || "Gagal memuat video. Silakan coba lagi.");
    } finally {
      setLoadingVideo(false);
    }
  }

  if (!id) {
    return <ErrorState message="Drama tidak ditemukan." />;
  }

  if (loadingDrama && !drama?.title) {
    return <LoadingSkeleton variant="detail" />;
  }

  if (dramaError && !drama?.title) {
    return (
      <ErrorState
        message={dramaError || "Gagal memuat data drama. Silakan coba lagi."}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (!drama?.title) {
    return (
      <EmptyState
        title="Drama tidak ditemukan."
        description="Coba kembali ke halaman utama dan cari judul lain."
      />
    );
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="relative aspect-[3/4]">
            <Image
              src={drama.cover_image || "/favicon.ico"}
              alt={drama.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 280px"
              priority
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {drama.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
              {episodeCount ? <span>{episodeCount} episode</span> : null}
              {drama.tags?.length ? <span>•</span> : null}
              {drama.tags?.length ? (
                <span className="line-clamp-1">
                  {drama.tags.slice(0, 4).join(" · ")}
                </span>
              ) : null}
            </div>
          </div>

          {drama.introduction ? (
            <p className="leading-relaxed text-foreground/90">
              {drama.introduction}
            </p>
          ) : (
            <p className="text-muted">Deskripsi belum tersedia.</p>
          )}

          {dramaError ? (
            <div className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted">
              {dramaError}
            </div>
          ) : null}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Daftar episode</h2>

          {!episodes.length ? (
            <EmptyState
              title="Episode belum tersedia."
              description="Tidak ada daftar episode untuk drama ini."
            />
          ) : (
            <EpisodeList
              episodes={episodes}
              selected={selectedEpisode}
              onSelect={handleSelectEpisode}
            />
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Pemutar video</h2>

          {loadingVideo ? (
            <LoadingSkeleton variant="player" />
          ) : sources.length ? (
            <VideoPlayer
              title={`${drama.title} — Episode ${selectedEpisode}`}
              sources={sources}
              onPlaybackError={() =>
                setVideoError(
                  "Video gagal diputar. Coba pilih resolusi lain atau muat ulang halaman."
                )
              }
            />
          ) : selectedEpisode ? (
            <ErrorState
              message={
                videoError ||
                "Video gagal diputar. Coba pilih resolusi lain atau muat ulang halaman."
              }
              onRetry={() => handleSelectEpisode(selectedEpisode)}
            />
          ) : (
            <EmptyState
              title="Pilih episode untuk mulai menonton"
              description="Klik salah satu episode di sebelah kiri."
            />
          )}
        </div>
      </section>
    </div>
  );
}
