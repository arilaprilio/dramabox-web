import Image from "next/image";
import Link from "next/link";

export default function DramaCard({ drama, priority = false }) {
  const intro = drama.introduction || "";

  return (
    <Link
      href={{
        pathname: `/drama/${drama.id}`,
        query: {
          title: drama.title || "",
          cover: drama.cover_image || "",
          intro: intro || "",
          episodes: String(drama.episode_count || ""),
          tags: (drama.tags || []).join(","),
        },
      }}
      className="group overflow-hidden rounded-2xl border border-border bg-surface transition hover:bg-surface-2"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={drama.cover_image || "/favicon.ico"}
          alt={drama.title || "Drama"}
          fill
          className="object-cover transition duration-300 group-hover:scale-[1.02]"
          sizes="(max-width: 1024px) 100vw, 33vw"
          priority={priority}
          loading={priority ? "eager" : "lazy"}
        />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/75 to-transparent" />

        {drama.episode_count ? (
          <div className="absolute left-3 top-3 rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/10">
            {drama.episode_count} ep
          </div>
        ) : null}
      </div>

      <div className="space-y-2 p-4">
        <div className="line-clamp-2 text-base font-semibold leading-snug tracking-tight text-foreground">
          {drama.title || "Tanpa judul"}
        </div>
        {intro ? (
          <p className="line-clamp-2 text-sm text-muted">{intro}</p>
        ) : (
          <p className="text-sm text-muted">Info singkat belum tersedia.</p>
        )}
      </div>
    </Link>
  );
}
