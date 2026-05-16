# Implementasi Fitur Registrasi User Baru

Dokumen ini berisi panduan dan instruksi teknis (high-level) untuk mengimplementasikan fitur registrasi user baru pada backend. Silakan ikuti spesifikasi dan langkah-langkah di bawah ini.

## 1. Spesifikasi Database (Drizzle ORM)

Update file skema database (misal: `src/db/schema.ts`) untuk mendefinisikan tabel `user` dengan struktur berikut:

- `id`: integer, auto increment, primary key
- `username`: varchar(50), not null, unique
- `password`: varchar(255), not null (akan diisi dengan nilai hash dari bcrypt)
- `email`: varchar(255), not null, unique
- `created_at`: timestamp, default current_timestamp
- `updated_at`: timestamp, default current_timestamp on update current_timestamp

**Catatan:** Pastikan untuk menjalankan perintah migrasi/push database (misal `bun run db:push` atau `bun run db:generate`) setelah skema diperbarui.

## 2. Struktur Folder & File

Buat struktur folder dan file di dalam direktori `src` dengan aturan berikut:

- `src/routes/`: Direktori untuk menyimpan semua routing Elysia.js.
  - Gunakan format penamaan file: `[nama]-route.ts` (contoh: `user-route.ts`).
- `src/services/`: Direktori untuk menyimpan semua business logic (proses validasi, manipulasi data, hashing).
  - Gunakan format penamaan file: `[nama]-service.ts` (contoh: `user-service.ts`).

## 3. Spesifikasi API Endpoint

Buat endpoint baru untuk registrasi user:
- **Metode HTTP**: `POST`
- **Endpoint**: `/api/user`

### Request Body (JSON)
Pastikan API menerima input berupa JSON seperti berikut:
```json
{
    "username": "john_doe",
    "email": "user@example.com",
    "password": "password"
}
```

### Response Sukses (JSON)
Jika registrasi berhasil, API harus mengembalikan response dengan HTTP Status 200 (atau 201) dan body:
```json
{
    "data": "oke"
}
```

### Response Error (JSON)
Jika terjadi kegagalan (misalnya username/email sudah terdaftar, atau error database), API harus mengembalikan response error (disarankan HTTP Status 400 atau 500) dan body:
```json
{
    "error": "gagal membuat user"
}
```

## 4. Langkah-Langkah Implementasi (Step-by-Step)

Untuk programmer atau AI yang mengimplementasikan fitur ini, ikuti urutan pengerjaan berikut:

1. **Setup Database**:
   - Buka `src/db/schema.ts` (atau buat jika belum ada) dan ubah/tambahkan skema tabel `user` sesuai spesifikasi di atas menggunakan Drizzle ORM.
   - Jalankan script Drizzle Kit (seperti `db:push` di `package.json`) untuk mensinkronkan perubahan skema ke database MySQL lokal.

2. **Instalasi Dependencies (Bcrypt)**:
   - Tambahkan package untuk hashing password. Disarankan menggunakan `bcrypt` atau `bcryptjs`.
   - Jalankan: `bun add bcryptjs` dan `bun add -D @types/bcryptjs`.

3. **Buat Business Logic (Service)**:
   - Buat file `src/services/user-service.ts`.
   - Buat fungsi `registerUser(data)` di dalam file tersebut.
   - Di dalam fungsi ini, lakukan hal berikut:
     - Hash field `password` dari input menggunakan `bcryptjs` (jangan simpan password asli ke database).
     - Lakukan proses insert data (username, email, password yang sudah di-hash) ke dalam tabel `user` menggunakan Drizzle ORM instance (`db`).
     - Gunakan blok `try...catch` untuk menangkap error dari database (seperti duplikat email/username).

4. **Buat Routing (Route)**:
   - Buat file `src/routes/user-route.ts`.
   - Setup route Elysia dengan endpoint `POST /api/user`.
   - Panggil fungsi `registerUser()` dari `user-service.ts` di dalam route handler.
   - Validasi body request menggunakan validator bawaan Elysia (`t.Object`) untuk memastikan `username`, `email`, dan `password` bertipe string dan tidak kosong.
   - Kembalikan response `{"data": "oke"}` jika service berhasil, atau tangkap error dan kembalikan `{"error": "gagal membuat user"}`.

5. **Registrasi Route ke Aplikasi Utama**:
   - Buka `src/index.ts`.
   - Import route dari `user-route.ts` dan daftarkan ke instance utama Elysia menggunakan method `.use()`.

6. **Pengujian (Testing)**:
   - Jalankan server development (`bun run dev`).
   - Gunakan tools seperti Postman, cURL, atau ekstensi REST Client untuk mengirimkan request `POST /api/user`.
   - Pastikan response sesuai dengan spesifikasi sukses maupun error.
   - Cek database MySQL untuk memastikan data berhasil tersimpan dengan password yang telah terenkripsi (di-hash).
