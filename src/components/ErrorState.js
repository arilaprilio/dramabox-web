export default function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="space-y-2">
        <div className="text-base font-semibold">Terjadi masalah</div>
        <p className="text-sm text-muted">
          {message || "Gagal memuat data. Silakan coba lagi."}
        </p>
      </div>

      {onRetry ? (
        <div className="mt-4">
          <button
            type="button"
            onClick={onRetry}
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500"
          >
            Coba lagi
          </button>
        </div>
      ) : null}
    </div>
  );
}
