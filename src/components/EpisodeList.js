"use client";

export default function EpisodeList({ episodes, selected, onSelect }) {
  return (
    <div className="max-h-[560px] overflow-auto rounded-2xl border border-border bg-surface p-2">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
        {episodes.map((ep) => {
          const active = selected === ep;
          return (
            <button
              key={ep}
              type="button"
              onClick={() => onSelect?.(ep)}
              className={
                "group cursor-pointer rounded-xl px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-4 focus:ring-ring/40 active:scale-[0.98] " +
                (active
                  ? "bg-brand-600 text-white shadow-[0_0_0_1px_rgba(96,165,250,0.25)]"
                  : "bg-background/30 text-foreground/90 hover:bg-background/45 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.10)] hover:-translate-y-[1px]")
              }
            >
              <span className="tabular-nums">EP {ep}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
