## DramaBox (Next.js App Router + JavaScript)

Aplikasi web streaming drama dengan:
- Halaman utama: list drama (Hidden Gems) + pencarian berdasarkan judul
- Halaman detail: cover, judul, sinopsis, info tambahan (tags & jumlah episode), daftar episode
- Pemutar video: pilihan resolusi (default tertinggi), tombol download, error handling
- Loading skeleton + empty state yang jelas

### Konfigurasi API
Default base URL:
- `https://db.hafizhibnusyam.my.id`

Opsional: buat `.env.local` (di root project) untuk mengganti base URL:

```
NEXT_PUBLIC_DRAMABOX_API_BASE_URL=https://domain-api-kamu.com
```

### Menjalankan project
Masuk ke folder project:

```
cd dramabox-web
npm run dev
```

Buka `http://localhost:3000`.

### Credits & Thanks
- API default (data drama + stream URL) menggunakan base URL: `https://db.hafizhibnusyam.my.id` — terima kasih.
- Video player menggunakan library Plyr (`plyr`, `plyr-react`) — thanks to the maintainers.

### AI Attribution
Project ini dibuat sepenuhnya dengan bantuan AI melalui GitHub Copilot Chat (model GPT-5.2). Tetap disarankan melakukan review manual sebelum dipakai di produksi.

Catatan: aplikasi ini hanya client UI untuk konsumsi API pihak ketiga. Ketersediaan endpoint dan konten dapat berubah sewaktu-waktu.
