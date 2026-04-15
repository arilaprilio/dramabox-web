"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";

const PlyrVideo = dynamic(() => import("plyr-react").then((m) => m.Plyr), {
  ssr: false,
});

export default function VideoPlayer({
  title,
  sources,
  isLoading = false,
  onPlaybackError,
  onEnded,
}) {
  const hostRef = useRef(null);
  const frameRef = useRef(null);
  const plyrRef = useRef(null);
  const restoreFullscreenRef = useRef(false);
  const stablePlyrSourceRef = useRef(null);
  const appliedUrlRef = useRef(null);
  const [selectedQuality, setSelectedQuality] = useState(null);
  const [isSwitching, setIsSwitching] = useState(false);
  const [resume, setResume] = useState(null);
  const [aspectRatio, setAspectRatio] = useState("16 / 9");
  const lastTapRef = useRef({ time: 0, x: 0 });

  const isPlayerFullscreen = () => {
    try {
      const plyr = plyrRef.current?.plyr;
      if (typeof plyr?.fullscreen?.active === "boolean") {
        return plyr.fullscreen.active;
      }
    } catch {
      // ignore
    }

    const fsEl =
      typeof document !== "undefined" ? document.fullscreenElement : null;
    const host = hostRef.current;
    return !!fsEl && !!host && host.contains(fsEl);
  };

  const sorted = useMemo(() => {
    const safe = Array.isArray(sources) ? sources : [];
    return [...safe].sort((a, b) => (b.quality || 0) - (a.quality || 0));
  }, [sources]);

  const selectedSource = useMemo(() => {
    if (!sorted.length) return null;
    const chosen = selectedQuality ?? sorted[0].quality;
    return sorted.find((s) => s.quality === chosen) || sorted[0];
  }, [sorted, selectedQuality]);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const SEEK_SECONDS = 5;

    const getVideo = () => frame.querySelector("video");

    const seek = (delta) => {
      const video = getVideo();
      if (!video) return;
      const duration = Number.isFinite(video.duration) ? video.duration : null;
      const next = (video.currentTime || 0) + delta;
      const clamped =
        duration == null
          ? Math.max(0, next)
          : Math.min(duration, Math.max(0, next));
      video.currentTime = clamped;
    };

    const onDblClickCapture = (e) => {
      try {
        const rect = frame.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const isLeft = x < rect.width / 2;
        e.preventDefault();
        e.stopPropagation();
        seek(isLeft ? -SEEK_SECONDS : SEEK_SECONDS);
      } catch {
        // ignore
      }
    };

    const onTouchEndCapture = (e) => {
      // Fallback untuk mobile: double-tap kiri/kanan = seek 5 detik
      const touch = e.changedTouches?.[0];
      if (!touch) return;

      const now = Date.now();
      const last = lastTapRef.current;
      const within = now - last.time <= 300;
      const near = Math.abs(touch.clientX - last.x) <= 80;

      if (within && near) {
        try {
          const rect = frame.getBoundingClientRect();
          const x = touch.clientX - rect.left;
          const isLeft = x < rect.width / 2;
          e.preventDefault();
          e.stopPropagation();
          seek(isLeft ? -SEEK_SECONDS : SEEK_SECONDS);
        } catch {
          // ignore
        } finally {
          lastTapRef.current = { time: 0, x: 0 };
        }
        return;
      }

      lastTapRef.current = { time: now, x: touch.clientX };
    };

    frame.addEventListener("dblclick", onDblClickCapture, true);
    frame.addEventListener("touchend", onTouchEndCapture, {
      capture: true,
      passive: false,
    });

    return () => {
      frame.removeEventListener("dblclick", onDblClickCapture, true);
      frame.removeEventListener("touchend", onTouchEndCapture, true);
    };
  }, [selectedSource?.url]);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    let currentVideo = null;
    let endFired = false;
    const fireEnded = () => {
      if (endFired) return;
      endFired = true;
      onEnded?.();
    };

    const handleEnded = () => {
      // Simpan status fullscreen agar bisa dipulihkan setelah pindah source.
      restoreFullscreenRef.current = isPlayerFullscreen();
      fireEnded();
    };
    const handlePause = () => {
      const video = currentVideo;
      if (!video) return;
      if (video.ended) {
        restoreFullscreenRef.current = isPlayerFullscreen();
        fireEnded();
      }
    };
    const handlePlay = () => {
      endFired = false;
    };

    const attachToActiveVideo = () => {
      const video = frame.querySelector("video");
      if (!video || video === currentVideo) return;

      if (currentVideo) {
        currentVideo.removeEventListener("ended", handleEnded);
        currentVideo.removeEventListener("pause", handlePause);
        currentVideo.removeEventListener("play", handlePlay);
      }

      currentVideo = video;
      currentVideo.addEventListener("ended", handleEnded);
      currentVideo.addEventListener("pause", handlePause);
      currentVideo.addEventListener("play", handlePlay);
    };

    attachToActiveVideo();

    const observer = new MutationObserver(() => {
      // Plyr kadang mengganti node <video> internal.
      attachToActiveVideo();
    });
    observer.observe(frame, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      if (currentVideo) {
        currentVideo.removeEventListener("ended", handleEnded);
        currentVideo.removeEventListener("pause", handlePause);
        currentVideo.removeEventListener("play", handlePlay);
      }
      currentVideo = null;
    };
  }, [selectedSource?.url, onEnded]);

  useEffect(() => {
    if (!sorted.length) return;
    // default: resolusi tertinggi
    setSelectedQuality(sorted[0].quality);
  }, [sorted]);

  const plyrOptions = useMemo(
    () => ({
      controls: [
        "play-large",
        "play",
        "progress",
        "current-time",
        "duration",
        "mute",
        "volume",
        "settings",
        "fullscreen",
      ],
      settings: ["speed"],
      speed: {
        selected: 1,
        options: [0.5, 0.75, 1, 1.25, 1.5, 2],
      },
      // Ratio diatur oleh wrapper luar agar video portrait tidak kepotong.
    }),
    []
  );

  const plyrSource = useMemo(() => {
    if (!selectedSource?.url) return null;
    return {
      type: "video",
      title: title || "DramaBox",
      sources: [
        {
          src: selectedSource.url,
          type: "video/mp4",
        },
      ],
    };
  }, [selectedSource?.url, title]);

  // IMPORTANT:
  // `plyr-react` akan destroy & instantiate ulang Plyr saat prop `source` berubah.
  // Itu biasanya membuat browser keluar fullscreen.
  // Jadi: set `source` hanya SEKALI, lalu update URL video dengan mengganti `video.src`.
  useEffect(() => {
    if (!stablePlyrSourceRef.current && plyrSource) {
      stablePlyrSourceRef.current = plyrSource;
    }
  }, [plyrSource]);

  useEffect(() => {
    const frame = frameRef.current;
    const desiredUrl = selectedSource?.url;
    if (!frame || !desiredUrl) return;

    const applyToVideo = () => {
      const video = frame.querySelector("video");
      if (!video) return false;

      // Hindari reload berulang untuk URL yang sama.
      if (appliedUrlRef.current === desiredUrl) return true;

      const current = video.currentSrc || video.src;
      if (current === desiredUrl) {
        appliedUrlRef.current = desiredUrl;
        return true;
      }

      try {
        video.src = desiredUrl;
        video.load();
      } catch {
        // ignore
      } finally {
        appliedUrlRef.current = desiredUrl;
      }

      return true;
    };

    // Coba langsung; kalau <video> belum ada (dynamic import), tunggu via observer.
    if (applyToVideo()) return;

    const observer = new MutationObserver(() => {
      if (applyToVideo()) observer.disconnect();
    });
    observer.observe(frame, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [selectedSource?.url]);

  async function handleQualityChange(newQuality) {
    if (isLoading) return;
    setIsSwitching(true);
    try {
      const next = sorted.find((s) => s.quality === newQuality);
      if (!next?.url) {
        setSelectedQuality(newQuality);
        return;
      }

      // Kalau lagi fullscreen, coba pertahankan setelah source berganti.
      restoreFullscreenRef.current = isPlayerFullscreen();

      const media = hostRef.current?.querySelector("video");
      const prevTime = media?.currentTime || 0;
      const shouldAutoPlay = media ? !media.paused : false;

      setResume({ time: prevTime, shouldAutoPlay });
      setSelectedQuality(newQuality);
    } catch {
      setIsSwitching(false);
    }
  }

  async function handleLoadedMetadata(e) {
    if (!resume) {
      setIsSwitching(false);
      // Tetap deteksi orientasi untuk sizing yang pas.
      const media = e.currentTarget;
      if (media?.videoWidth && media?.videoHeight) {
        setAspectRatio(media.videoHeight > media.videoWidth ? "9 / 16" : "16 / 9");
      }

      // Jika baru pindah episode saat fullscreen, coba masuk lagi.
      if (restoreFullscreenRef.current) {
        restoreFullscreenRef.current = false;
        try {
          const plyr = plyrRef.current?.plyr;
          if (plyr?.fullscreen && !plyr.fullscreen.active) {
            plyr.fullscreen.enter();
          }
        } catch {
          // ignore (browser bisa menolak tanpa user gesture)
        }
      }
      return;
    }

    const media = e.currentTarget;
    try {
      if (media?.videoWidth && media?.videoHeight) {
        setAspectRatio(media.videoHeight > media.videoWidth ? "9 / 16" : "16 / 9");
      }
      if (Number.isFinite(resume.time)) {
        media.currentTime = resume.time;
      }
      if (resume.shouldAutoPlay) {
        await media.play();
      }
    } catch {
      // ignore
    } finally {
      setResume(null);
      setIsSwitching(false);

      if (restoreFullscreenRef.current) {
        restoreFullscreenRef.current = false;
        try {
          const plyr = plyrRef.current?.plyr;
          if (plyr?.fullscreen && !plyr.fullscreen.active) {
            plyr.fullscreen.enter();
          }
        } catch {
          // ignore
        }
      }
    }
  }

  if (!selectedSource?.url) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-4 text-sm text-muted">
        Video tidak tersedia.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="dramabox-player overflow-hidden rounded-2xl border border-border bg-black">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-foreground">
              {title}
            </div>
            <div className="text-xs text-muted">
              {isLoading
                ? "Memuat episode…"
                : isSwitching
                  ? "Mengganti resolusi…"
                  : ""}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs font-medium text-muted" htmlFor="quality">
              Resolusi
            </label>
            <select
              id="quality"
              value={selectedSource.quality}
              onChange={(e) => handleQualityChange(Number(e.target.value))}
              disabled={isLoading || isSwitching}
              className="rounded-xl border border-border bg-background/40 px-3 py-2 text-sm text-foreground outline-none focus:ring-4 focus:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sorted.map((s) => (
                <option key={s.quality} value={s.quality}>
                  {s.quality}p
                </option>
              ))}
            </select>

            <a
              href={selectedSource.url}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500"
            >
              Download
            </a>
          </div>
        </div>

        <div ref={hostRef} className="grid place-items-center bg-black p-3 sm:p-4">
          <div className="w-full max-w-[520px]">
            <div className="overflow-hidden rounded-2xl bg-black">
              <div
                className="dramabox-video-frame relative"
                style={{ aspectRatio, maxHeight: "72vh" }}
                ref={frameRef}
              >
                <PlyrVideo
                  ref={plyrRef}
                  source={stablePlyrSourceRef.current}
                  options={plyrOptions}
                  onLoadedMetadata={handleLoadedMetadata}
                  onError={() => {
                    setIsSwitching(false);
                    onPlaybackError?.();
                  }}
                />

                {isLoading ? (
                  <div className="absolute inset-0 grid place-items-center bg-black/40">
                    <div className="rounded-xl border border-border bg-surface/90 px-4 py-3 text-sm font-semibold text-foreground">
                      Memuat episode…
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
