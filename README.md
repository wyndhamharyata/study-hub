# StudyHub — Checkpoint 1

Platform kolaborasi belajar real-time berbasis cloud. Pengguna dapat membuat study room, berbagi catatan, dan berlatih dengan flashcard.

## Layanan Cloud

| Layanan | Fungsi |
|---------|--------|
| **Firebase Authentication** | Register & login dengan email/password + verifikasi email |
| **Firebase Realtime Database** | Penyimpanan data real-time (rooms, users) |
| **Cloudflare Workers** | Hosting backend (Hono) + serving SPA |
| **SST (Serverless Stack)** | Infrastructure as Code untuk deployment ke Cloudflare |

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS 4, DaisyUI 5
- **Backend**: Hono (Cloudflare Workers)
- **Database**: Firebase Realtime Database
- **Auth**: Firebase Authentication
- **Deployment**: SST + Cloudflare

## Fungsi CRUD yang Sudah Terkoneksi ke Firebase Realtime Database

| # | Operasi | Entity | Deskripsi |
|---|---------|--------|-----------|
| 1 | **Create** | Room | Membuat study room baru (`set(ref(db, 'studyhub/rooms/...'))`) |
| 2 | **Read** | Room | Menampilkan daftar room secara real-time (`onValue(ref(db, 'studyhub/rooms'))`) |
| 3 | **Update** | Room | Mengubah nama dan deskripsi room (`update(ref(db, 'studyhub/rooms/...'))`) |
| 4 | **Delete** | Room | Menghapus room (`remove(ref(db, 'studyhub/rooms/...'))`) |

## Fitur yang Sudah Selesai

- Project scaffold (Hono + React + Vite + SST + Tailwind/DaisyUI)
- **Firebase Authentication**: register, login, email verification (webmailer)
- **Room CRUD**: create, read (real-time), update, delete
- Room detail page dengan navigasi
- DaisyUI theme (light + dark mode, dari marknotes-cf)
- Deployment ke Cloudflare Workers (`studyhub.mwyndham.dev`)
- SST DevCommands untuk local development (LocalVite, RebuildClient)

## Rencana Fitur Selanjutnya

- Notes CRUD (create, read, update, delete) dengan real-time updates
- Flashcards CRUD (create, read, update, delete) dengan flip interaction
- Creator info pada setiap entity
- View toggle (list/grid)
- Markdown rendering
- Room banner image

## GitHub

Repository: [wyndhamharyata/study-hub](https://github.com/wyndhamharyata/study-hub)
