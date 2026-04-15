import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600/20 ring-1 ring-brand-400/30">
            <span className="text-lg font-bold text-brand-200">D</span>
          </div>
          <div className="leading-tight">
            <div className="text-base font-semibold tracking-tight">DramaBox</div>
            <div className="text-xs text-muted">Streaming drama modern</div>
          </div>
        </Link>

        <a
          href="https://db.hafizhibnusyam.my.id/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-border bg-surface px-4 py-2 text-sm text-foreground/90 hover:bg-surface-2"
        >
          API Docs
        </a>
      </div>
    </header>
  );
}
