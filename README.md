# StudyHub — Checkpoint 2

Platform kolaborasi belajar real-time berbasis cloud. Pengguna dapat membuat study room, berbagi catatan, dan berlatih dengan flashcard.

## Layanan Cloud

| Layanan | Fungsi |
|---------|--------|
| **Firebase Authentication** | Register & login dengan email/password + verifikasi email |
| **Firebase Realtime Database** | Penyimpanan data real-time (rooms, notes, flashcards, users) |
| **Cloudflare Workers** | Hosting backend (Hono) + serving SPA |
| **SST (Serverless Stack)** | Infrastructure as Code untuk deployment ke Cloudflare |

## 12 Fungsi CRUD (Firebase Realtime Database)

| # | Operasi | Entity | Deskripsi |
|---|---------|--------|-----------|
| 1 | **Create** | Room | Membuat study room baru |
| 2 | **Read** | Room | Menampilkan daftar room (real-time via `onValue`) |
| 3 | **Update** | Room | Mengubah nama dan deskripsi room |
| 4 | **Delete** | Room | Menghapus room beserta notes dan flashcards (cascade) |
| 5 | **Create** | Note | Menambahkan catatan ke room |
| 6 | **Read** | Note | Menampilkan catatan dalam room (real-time via `onValue`) |
| 7 | **Update** | Note | Mengubah judul dan konten catatan |
| 8 | **Delete** | Note | Menghapus catatan |
| 9 | **Create** | Flashcard | Menambahkan flashcard ke room |
| 10 | **Read** | Flashcard | Menampilkan flashcard dalam room (real-time via `onValue`) |
| 11 | **Update** | Flashcard | Mengubah pertanyaan dan jawaban flashcard |
| 12 | **Delete** | Flashcard | Menghapus flashcard |

## Fungsi yang Sudah Selesai

### Dari Checkpoint 1
- Project scaffold (Hono + React + Vite + SST + Tailwind/DaisyUI)
- Firebase Authentication: register, login, email verification
- Room CRUD: create, read (real-time), update, delete
- Room detail page, DaisyUI theme (light + dark mode)

### Baru di Checkpoint 2
- **Notes CRUD**: create, read (real-time), update, delete — catatan per room dengan judul dan konten
- **Flashcards CRUD**: create, read (real-time), update, delete — dengan **flip interaction** (klik untuk lihat jawaban)
- **12 CRUD operations tercapai**
- **Creator info**: nama pembuat ditampilkan pada room, notes, dan flashcards (via real-time user lookup dari `studyhub/users`)
- **List/grid view toggle**: switch antara tampilan list dan grid untuk notes dan flashcards (menggunakan icon)
- **Flashcard warna**: background `warning/15` (question) dan `success/15` (answer) dengan badge yang sesuai
- **Cascade delete**: menghapus room otomatis menghapus semua notes dan flashcards di dalamnya
- **User sync**: user yang register di project lain (CloudComp) otomatis ter-sync ke `studyhub/users`

## Rencana Fitur Selanjutnya

- Markdown rendering untuk deskripsi dan catatan
- Side menu navigation (menggantikan tabs)
- Room banner image via Cloudflare R2
- Note detail modal
- Card expand animation

## GitHub

Repository: [wyndhamharyata/study-hub](https://github.com/wyndhamharyata/study-hub)
