export default function EmptyState({ title, description }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="space-y-2">
        <div className="text-base font-semibold">{title || "Data kosong"}</div>
        {description ? <p className="text-sm text-muted">{description}</p> : null}
      </div>
    </div>
  );
}
