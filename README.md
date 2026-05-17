# Belajar Vibe Coding

Aplikasi ini adalah backend layanan API (Application Programming Interface) untuk manajemen pengguna sederhana. Aplikasi ini mendukung fitur-fitur seperti registrasi pengguna, login untuk mendapatkan token sesi, mengambil data pengguna yang sedang login berdasarkan token, serta logout. Aplikasi ini dibangun dengan performa tinggi menggunakan runtime Bun, framework web Elysia.js, dan Drizzle ORM untuk interaksi dengan database MySQL.

## Teknologi dan Library yang Digunakan

### Teknologi Utama
- **[Bun](https://bun.sh/)**: Runtime JavaScript dan TypeScript yang super cepat, digunakan sebagai eksekutor, package manager, dan test runner.
- **[Elysia.js](https://elysiajs.com/)**: Framework web yang sangat cepat dan ergonomis untuk membangun server HTTP.
- **[Drizzle ORM](https://orm.drizzle.team/)**: TypeScript ORM yang ringan dan cepat untuk mengakses database.
- **MySQL**: Sistem manajemen basis data relasional yang digunakan (melalui driver `mysql2`).

### Library Pendukung
- **[bcryptjs](https://www.npmjs.com/package/bcryptjs)**: Library untuk melakukan hashing pada password agar aman disimpan di dalam database.
- **drizzle-kit**: CLI (Command Line Interface) tool untuk Drizzle ORM yang membantu dalam migrasi dan sinkronisasi skema ke database.

## Struktur Folder dan File

Berikut adalah arsitektur direktori dari proyek ini:

```text
belajar-vibe-coding/
├── src/                    # Direktori utama kode sumber aplikasi
│   ├── db/                 # Folder untuk hal-hal terkait database
│   │   ├── index.ts        # Konfigurasi koneksi database
│   │   └── schema.ts       # Definisi skema tabel database dengan Drizzle
│   ├── routes/             # Folder yang berisi definisi endpoint API
│   │   └── user-route.ts   # Route handler untuk fungsionalitas user
│   ├── services/           # Folder yang berisi business logic aplikasi
│   │   └── user-service.ts # Logika utama untuk register, login, get current, logout
│   └── index.ts            # Entry point aplikasi (konfigurasi Elysia dan server)
├── test/                   # Direktori untuk file unit testing
│   └── user.test.ts        # Skenario tes otomatis (menggunakan bun test)
├── .env                    # File konfigurasi environment (kredensial database)
├── drizzle.config.ts       # File konfigurasi untuk Drizzle Kit
├── package.json            # Konfigurasi project dan daftar dependensi
└── bun.lock                # Lock file untuk package bun
```

## Skema Database

Aplikasi ini memiliki 2 tabel utama yang terhubung satu sama lain (relasi one-to-many antara User dan Session):

### 1. Tabel `users`
Tabel yang menyimpan data akun pengguna.
- `id` (INT): Primary key, auto-increment.
- `username` (VARCHAR 50): Username unik pengguna.
- `password` (VARCHAR 255): Password yang sudah di-hash (menggunakan bcrypt).
- `email` (VARCHAR 255): Alamat email unik pengguna.
- `created_at` (TIMESTAMP): Waktu akun dibuat (default current timestamp).
- `updated_at` (TIMESTAMP): Waktu akun diupdate (otomatis update saat ada perubahan).

### 2. Tabel `sessions`
Tabel yang menyimpan sesi login dari pengguna.
- `id` (INT): Primary key, auto-increment.
- `user_id` (INT): Foreign key yang merujuk ke tabel `users.id`.
- `token` (VARCHAR 255): Token sesi unik yang dihasilkan saat user login.
- `expired_at` (TIMESTAMP): Waktu kedaluwarsa sesi token.
- `created_at` (TIMESTAMP): Waktu sesi dibuat (default current timestamp).

## API yang Tersedia

Base URL: `http://localhost:3000`

### 1. Register User
- **Endpoint**: `POST /api/user`
- **Body**:
  ```json
  {
    "username": "contohuser",
    "email": "user@contoh.com",
    "password": "password123"
  }
  ```
- **Response**: `200 OK` (berhasil) atau `400 Bad Request`.

### 2. Login User
- **Endpoint**: `POST /api/users/login`
- **Body**:
  ```json
  {
    "username": "contohuser",
    "password": "password123"
  }
  ```
- **Response**: Mengembalikan token sesi login pada properti `data.token`. `401 Unauthorized` jika gagal.

### 3. Get Current User
- **Endpoint**: `POST /api/users/current`
- **Headers**:
  - `Authorization: Bearer <token_anda>`
- **Response**: Mengembalikan data detail user yang sedang login saat ini.

### 4. Logout User
- **Endpoint**: `DELETE /api/users/logout`
- **Headers**:
  - `Authorization: Bearer <token_anda>`
- **Response**: Menghapus token dari database dan sesi berakhir.

## Setup Project

Langkah-langkah untuk menyiapkan proyek di lokal:

1. **Install Dependensi**
   Pastikan Anda sudah menginstall `bun` di sistem Anda.
   ```bash
   bun install
   ```

2. **Setup Environment**
   Ubah atau buat file `.env` di root direktori dengan detail koneksi database MySQL Anda:
   ```env
   DATABASE_URL="mysql://root:password@localhost:3306/belajar_vibe_coding"
   ```

3. **Sinkronisasi Database**
   Gunakan perintah berikut untuk mendorong (`push`) skema Drizzle ke dalam database MySQL Anda (pastikan database `belajar_vibe_coding` sudah dibuat di MySQL):
   ```bash
   bun run db:push
   ```

## Cara Menjalankan Aplikasi

Untuk menjalankan server pengembangan dengan fitur auto-reload:

```bash
bun run dev
```

Server akan berjalan pada `http://localhost:3000`.

## Cara Melakukan Test Aplikasi

Aplikasi ini menggunakan test runner bawaan dari Bun. Pastikan koneksi database sudah diatur dengan benar di `.env` sebelum menjalankan pengujian.

Untuk menjalankan semua pengujian unit:

```bash
bun test
```
