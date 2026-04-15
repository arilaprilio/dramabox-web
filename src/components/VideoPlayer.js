"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";

const PlyrVideo = dynamic(() => import("plyr-react").then((m) => m.Plyr), {
  ssr: false,
});

export default function VideoPlayer({ title, sources, onPlaybackError }) {
  const hostRef = useRef(null);
  const [selectedQuality, setSelectedQuality] = useState(null);
  const [isSwitching, setIsSwitching] = useState(false);
  const [resume, setResume] = useState(null);
  const [aspectRatio, setAspectRatio] = useState("16 / 9");

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

  async function handleQualityChange(newQuality) {
    setIsSwitching(true);
    try {
      const next = sorted.find((s) => s.quality === newQuality);
      if (!next?.url) {
        setSelectedQuality(newQuality);
        return;
      }

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
              {isSwitching ? "Mengganti resolusi…" : ""}
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
              className="rounded-xl border border-border bg-background/40 px-3 py-2 text-sm text-foreground outline-none focus:ring-4 focus:ring-ring/40"
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
                className="dramabox-video-frame"
                style={{ aspectRatio, maxHeight: "72vh" }}
              >
                <PlyrVideo
                  source={plyrSource}
                  options={plyrOptions}
                  onLoadedMetadata={handleLoadedMetadata}
                  onError={() => {
                    setIsSwitching(false);
                    onPlaybackError?.();
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
