# Implementasi Fitur Login User & Session Management

Dokumen ini berisi panduan teknis dan tahapan-tahapan yang diperlukan untuk mengimplementasikan fitur login pengguna (user login) beserta manajemen sesinya (session management). Panduan ini dirancang agar mudah diikuti oleh programmer junior maupun AI pendamping.

## 1. Spesifikasi Database (Drizzle ORM)

Tambahkan definisi tabel baru yaitu `sessions` pada file skema database Anda (misalnya `src/db/schema.ts`). Tabel ini digunakan untuk menyimpan riwayat login pengguna.

**Struktur Tabel `sessions`:**
- `id`: integer, auto increment, primary key
- `user_id`: integer, foreign key yang merujuk ke tabel `users(id)`
- `token`: varchar(255), not null (berisi UUID unik sebagai token akses pengguna)
- `expired_at`: timestamp, not null (menandakan kapan token tersebut kedaluwarsa)
- `created_at`: timestamp, not null, default current_timestamp

*Catatan: Jangan lupa untuk menjalankan migrasi/push database (misal `bun run db:push`) setelah menambahkan skema ini.*

## 2. Spesifikasi API Endpoint

Buat endpoint baru untuk proses autentikasi (login):
- **Metode HTTP**: `POST`
- **Endpoint**: `/api/users/login`

### Request Body (JSON)
API harus menerima kredensial login dengan format berikut:
```json
{
    "username": "<username>",
    "password": "<password>"
}
```

### Response Sukses (JSON)
Jika kombinasi username dan password valid, kembalikan response dengan HTTP Status 200 beserta data user dan tokennya:
```json
{
    "message": "Login successful",
    "data": {
        "token": "<token>",
        "user": {
            "id": 1,
            "username": "<username>",
            "email": "<email>",
            "created_at": "<created_at>",
            "updated_at": "<updated_at>"
        }
    }
}
```

### Response Error (JSON)
Jika username tidak ditemukan atau password salah, kembalikan response dengan HTTP Status 401 (Unauthorized):
```json
{
    "message": "Invalid credentials",
    "error": "Unauthorized"
}
```

## 3. Struktur Folder dan File

Ikuti aturan penempatan file berikut di dalam folder `src/`:
- **`src/routes/`**: Tempat untuk menyimpan semua definisi routing Elysia.js. Gunakan akhiran `-routes.ts` (contoh: `user-routes.ts`).
- **`src/services/`**: Tempat untuk menyimpan business logic, seperti verifikasi password dan generate token. Gunakan akhiran `-service.ts` (contoh: `user-service.ts`).

---

## 4. Tahapan Implementasi (Step-by-Step)

Untuk mengimplementasikan fitur ini, ikuti langkah-langkah berurutan berikut:

### Langkah 1: Update Skema Database
1. Buka file `src/db/schema.ts`.
2. Buat relasi foreign key antara tabel `users` dan tabel `sessions` menggunakan Drizzle ORM.
3. Tambahkan tabel `sessions` sesuai dengan spesifikasi kolom di atas.
4. Jalankan perintah sinkronisasi Drizzle (misal: `bun run db:push`) agar tabel terbentuk di database MySQL lokal.

### Langkah 2: Buat Logika Service (Business Logic)
1. Buka (atau buat jika belum ada) file `src/services/user-service.ts`.
2. Buat fungsi baru bernama `loginUser(data)`.
3. **Pencarian User**: Di dalam fungsi tersebut, query database untuk mencari user berdasarkan `username` yang dikirimkan. Jika tidak ada, kembalikan status error "Invalid credentials".
4. **Verifikasi Password**: Jika user ditemukan, gunakan `bcrypt.compare` (dari library `bcryptjs`) untuk mencocokkan password dari request dengan password hash yang ada di database. Jika tidak cocok, kembalikan error "Invalid credentials".
5. **Generate Token**: Jika password cocok, buat sebuah UUID baru (misalnya menggunakan library bawaan `crypto` di Node/Bun atau library `uuid`) sebagai `token`.
6. **Simpan Session**: Hitung waktu kedaluwarsa token (misalnya 7 hari dari sekarang untuk kolom `expired_at`). Lakukan insert data ke tabel `sessions` yang berisi `user_id`, `token`, dan `expired_at`.
7. **Return Data**: Kembalikan object yang berisi `token` dan data `user` (tanpa field password) ke pemanggil fungsi.

### Langkah 3: Buat Route API
1. Buka (atau buat) file `src/routes/user-routes.ts`.
2. Buat route `POST /api/users/login`.
3. Gunakan fitur validasi Elysia (`t.Object`) untuk memastikan body request memiliki `username` dan `password` (keduanya bertipe string).
4. Di dalam handler route tersebut, panggil fungsi `loginUser()` dari service.
5. Tangani hasil kembaliannya: Jika sukses, kirimkan object sukses beserta datanya. Jika gagal (misal credentials salah), atur HTTP status menjadi `401` dan kirimkan format response error.

### Langkah 4: Registrasi Route
1. Buka `src/index.ts`.
2. Pastikan file route `user-routes.ts` diimpor dan didaftarkan menggunakan method `.use()` pada instance utama Elysia.

### Langkah 5: Pengujian
1. Jalankan server lokal dengan `bun run dev`.
2. Lakukan request `POST` ke `http://localhost:3000/api/users/login` menggunakan Postman, cURL, atau aplikasi sejenisnya.
3. Uji dengan password yang salah dan pastikan mendapat pesan Unauthorized.
4. Uji dengan akun valid (yang sebelumnya dibuat di fitur registrasi) dan pastikan Anda mendapatkan balasan yang berisi `token`. Cek database untuk memastikan token tersebut masuk ke tabel `sessions`.
