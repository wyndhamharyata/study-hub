# StudyHub

Platform kolaborasi belajar real-time berbasis cloud. Pengguna dapat membuat study room, berbagi catatan, dan berlatih dengan flashcard.

## Layanan Cloud

| Layanan | Fungsi |
|---------|--------|
| **Firebase Authentication** | Register & login dengan email/password + verifikasi email |
| **Firebase Realtime Database** | Penyimpanan data real-time (rooms, notes, flashcards, users) |
| **Cloudflare Workers** | Hosting backend (Hono) + serving SPA |
| **Cloudflare R2** | Penyimpanan banner image untuk room |
| **SST (Serverless Stack)** | Infrastructure as Code untuk deployment ke Cloudflare |

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS 4, DaisyUI 5
- **Backend**: Hono (Cloudflare Workers)
- **Database**: Firebase Realtime Database
- **Auth**: Firebase Authentication
- **Storage**: Cloudflare R2
- **Deployment**: SST + Cloudflare

## 12 Fungsi CRUD (Firebase Realtime Database)

| # | Operasi | Entity | Fungsi |
|---|---------|--------|--------|
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

## Fitur Authentication

- Register dengan email dan password
- Login dengan email dan password
- **Email verification** via Firebase (wajib verifikasi sebelum akses aplikasi)
- Sign out

## Branch & Progress

### `checkpoint-1` — Fondasi (20%)

Fitur yang sudah selesai:
- Project scaffold (Hono + React + Vite + SST + Tailwind/DaisyUI)
- Firebase Authentication (register, login, email verification)
- Room CRUD: create, read (real-time), update, delete
- Room detail page dengan navigasi
- Deployment ke Cloudflare Workers
- DaisyUI theme (light + dark mode)

### `checkpoint-2` — Fitur Utama (50%)

Fitur tambahan dari checkpoint-1:
- Notes CRUD: create, read (real-time), update, delete
- Flashcards CRUD: create, read (real-time), update, delete — dengan flip interaction (question/answer)
- **12 CRUD operations tercapai**
- Creator info pada room, notes, dan flashcards (real-time user lookup)
- List/grid view toggle untuk notes dan flashcards
- Warna flashcard: warning (question) dan success (answer) dengan muted opacity

### `checkpoint-3` — Polish & Fitur Lanjutan (95%)

Fitur tambahan dari checkpoint-2:
- Markdown rendering untuk deskripsi room dan konten notes (`react-markdown` + Tailwind Typography)
- Side menu navigation (menggantikan tabs) dengan DaisyUI menu component
- **Room banner image** via Cloudflare R2 storage — upload dalam modal, tampil sebagai hero image dan card background
- Note detail modal dengan full markdown rendering dan scroll
- Card expand animation saat navigasi dari room list ke room detail
- Room detail sebagai satu card besar dengan debossed content area
- Seluruh card pada room list menjadi touch target (click navigates to room)
- View toggle menggunakan icon (list/grid) dengan `btn-primary` active state

## Cara Menjalankan

```bash
# Install dependencies
npm install
cd client && npm install && cd ..

# Development (via SST multiplexer)
npm run dev

# Deploy ke Cloudflare
npm run deploy
```

## Environment Variables

### Root `.env`
```
CLOUDFLARE_API_TOKEN=...
CLOUDFLARE_DEFAULT_ACCOUNT_ID=...
CLOUDFLARE_DOMAIN_ZONE_ID=...
```

### Client `.env`
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_DATABASE_URL=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
```

## Firebase Realtime Database Schema

```
/studyhub/
  /users/{uid}          → { id, name, email, verified }
  /rooms/{roomId}       → { id, name, description, createdBy, createdAt, bannerUrl? }
  /notes/{roomId}/{id}  → { id, title, content, createdBy, createdAt, updatedAt }
  /flashcards/{roomId}/{id} → { id, question, answer, createdBy, createdAt, updatedAt }
```

## Domain

- **App**: `studyhub.mwyndham.dev`
- **Assets (R2)**: `studyhub-assets.mwyndham.dev`
