# StudyHub — Checkpoint 3 (95%)

Platform kolaborasi belajar real-time berbasis cloud. Pengguna dapat membuat study room, berbagi catatan, dan berlatih dengan flashcard.

## Layanan Cloud

| Layanan | Fungsi |
|---------|--------|
| **Firebase Authentication** | Register & login dengan email/password + verifikasi email |
| **Firebase Realtime Database** | Penyimpanan data real-time (rooms, notes, flashcards, users) |
| **Cloudflare Workers** | Hosting backend (Hono) + serving SPA |
| **Cloudflare R2** | Penyimpanan banner image untuk room |
| **SST (Serverless Stack)** | Infrastructure as Code untuk deployment ke Cloudflare |

## 12 Fungsi CRUD (Firebase Realtime Database)

| # | Operasi | Entity | Deskripsi |
|---|---------|--------|-----------|
| 1 | **Create** | Room | Membuat study room baru |
| 2 | **Read** | Room | Menampilkan daftar room (real-time via `onValue`) |
| 3 | **Update** | Room | Mengubah nama, deskripsi, dan banner room |
| 4 | **Delete** | Room | Menghapus room beserta notes dan flashcards (cascade) |
| 5 | **Create** | Note | Menambahkan catatan ke room |
| 6 | **Read** | Note | Menampilkan catatan dalam room (real-time via `onValue`) |
| 7 | **Update** | Note | Mengubah judul dan konten catatan |
| 8 | **Delete** | Note | Menghapus catatan |
| 9 | **Create** | Flashcard | Menambahkan flashcard ke room |
| 10 | **Read** | Flashcard | Menampilkan flashcard dalam room (real-time via `onValue`) |
| 11 | **Update** | Flashcard | Mengubah pertanyaan dan jawaban flashcard |
| 12 | **Delete** | Flashcard | Menghapus flashcard |

## Semua Fungsi yang Sudah Selesai

### Checkpoint 1 — Fondasi
- Project scaffold (Hono + React + Vite + SST + Tailwind/DaisyUI)
- Firebase Authentication: register, login, email verification (webmailer)
- Room CRUD: create, read (real-time), update, delete
- Room detail page, DaisyUI theme (light + dark mode)

### Checkpoint 2 — Fitur Utama
- Notes CRUD: create, read (real-time), update, delete
- Flashcards CRUD: create, read (real-time), update, delete — dengan flip interaction
- **12 CRUD operations tercapai**
- Creator info pada room, notes, dan flashcards (real-time user lookup)
- List/grid view toggle dengan icon
- Flashcard warna: warning (question) dan success (answer) dengan muted opacity
- Cascade delete dan user sync

### Checkpoint 3 — Polish & Fitur Lanjutan
- **Markdown rendering** untuk deskripsi room dan konten notes (`react-markdown` + Tailwind Typography)
- **Side menu navigation** menggantikan tabs — DaisyUI menu component dengan layout flex (sidebar desktop, horizontal mobile)
- **Room banner image** via Cloudflare R2 — drag-and-drop upload dengan inline preview, tampil sebagai full hero image di room detail dan card background di dashboard (dengan frosted glass overlay)
- **Note detail modal** — klik note card untuk lihat full content dengan markdown rendering, scrollable, action buttons di samping
- **Card expand animation** — transisi scale-up dari posisi card yang diklik ke room detail
- Room detail sebagai satu card besar dengan **debossed content area** (`bg-base-200 shadow-inner`)
- **Flashcard drag-and-drop reorder** — urutan tersimpan di Firebase, konsisten untuk semua user (@dnd-kit)
- **Mobile bottom sheet** — modal tampil sebagai bottom sheet dengan slide-up animation pada mobile
- **Responsive layout** — sidebar room info pada desktop, compact navbar pada mobile, floating profile pada room detail
- **Description read-more modal** pada mobile (truncated 3 baris + "Read more")
- Seluruh room card menjadi clickable touch target
- View toggle active state menggunakan `btn-primary`
- Vite proxy untuk development (`/api` -> production worker)

## Firebase Realtime Database Schema

```
/studyhub/
  /users/{uid}          -> { id, name, email, verified }
  /rooms/{roomId}       -> { id, name, description, createdBy, createdAt, bannerUrl? }
  /notes/{roomId}/{id}  -> { id, title, content, createdBy, createdAt, updatedAt }
  /flashcards/{roomId}/{id} -> { id, question, answer, createdBy, createdAt, updatedAt, order? }
```

## Domain

- **App**: `studyhub.mwyndham.dev`
- **Assets (R2)**: `studyhub-assets.mwyndham.dev`

## GitHub

Repository: [wyndhamharyata/study-hub](https://github.com/wyndhamharyata/study-hub)
