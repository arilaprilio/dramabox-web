"use client";

import { useMemo } from "react";

export default function SearchBar({ value, onChange, onSubmit, isLoading }) {
  const disabled = useMemo(() => isLoading, [isLoading]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
      className="flex flex-col gap-3 sm:flex-row"
    >
      <div className="flex-1">
        <label className="sr-only" htmlFor="search">
          Cari drama
        </label>
        <input
          id="search"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="Cari drama berdasarkan judul…"
          className="w-full rounded-2xl border border-border bg-background/40 px-4 py-3 text-sm text-foreground placeholder:text-muted outline-none ring-brand-400/30 focus:ring-4"
        />
      </div>

      <button
        type="submit"
        disabled={disabled}
        className="inline-flex items-center justify-center rounded-2xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Mencari…" : "Cari"}
      </button>
    </form>
  );
}
