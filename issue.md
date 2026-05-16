# Implementasi Fitur Get Current User (Get Profile)

Dokumen ini berisi panduan teknis dan tahapan-tahapan yang diperlukan untuk mengimplementasikan fitur pengambilan data pengguna yang sedang login (Current User). Panduan ini dirancang agar mudah diikuti oleh programmer junior maupun AI pendamping.

## 1. Spesifikasi API Endpoint

Buat endpoint baru untuk mengambil data profile user yang sedang login:
- **Metode HTTP**: `POST` (Sesuai dengan spesifikasi, meskipun untuk ambil data biasanya `GET`, kita ikuti `POST` jika disyaratkan, atau Anda dapat merubahnya ke `GET` jika lebih sesuai konvensi REST API).
- **Endpoint**: `/api/users/current`

### Headers
API ini membutuhkan autentikasi melalui header:
- **Authorization**: `Bearer <token>` 
*(Catatan: `<token>` adalah token UUID yang dihasilkan saat login dan disimpan di tabel `sessions` yang berelasi dengan tabel `users`)*.

### Response Sukses (JSON)
Jika token valid dan user ditemukan, kembalikan response dengan HTTP Status 200 beserta data usernya:
```json
{
    "message": "success",
    "data": {
        "id": 1,
        "username": "<username>",
        "email": "<email>",
        "created_at": "<created_at>",
        "updated_at": "<updated_at>"
    }
}
```

### Response Error (JSON)
Jika header Authorization tidak ada, formatnya salah, atau token tidak ditemukan di database (atau sudah kedaluwarsa), kembalikan response HTTP Status 401 (Unauthorized):
```json
{
    "message": "unauthorized",
    "error": "token not found"
}
```

## 2. Struktur Folder dan File

Ikuti aturan penempatan file berikut di dalam folder `src/`:
- **`src/routes/`**: Tambahkan routing baru di file routing user yang sudah ada (misal: `user-routes.ts` atau `user-route.ts`).
- **`src/services/`**: Tambahkan fungsi pengecekan token di file service user (misal: `user-service.ts`).

---

## 3. Tahapan Implementasi (Step-by-Step)

Untuk mengimplementasikan fitur ini, ikuti langkah-langkah berurutan berikut:

### Langkah 1: Buat Logika Service (Business Logic)
1. Buka file `src/services/user-service.ts`.
2. Buat fungsi baru bernama `getCurrentUser(token)`.
3. **Pencarian Token**: Lakukan query ke database menggunakan Drizzle ORM untuk mencari baris di tabel `sessions` yang memiliki `token` yang sama dengan parameter. Lakukan join/relasi (atau sertakan query bersarang) untuk mengambil data `users` yang berelasi dengan `user_id` di tabel session tersebut.
4. **Validasi Waktu (Opsional namun disarankan)**: Periksa apakah kolom `expired_at` dari sesi tersebut masih berlaku (belum melewati waktu saat ini).
5. **Penanganan Kondisi**:
   - Jika token tidak ditemukan atau sudah kedaluwarsa, kembalikan hasil gagal/error.
   - Jika token valid, ekstrak data `user` tersebut. Hapus field sensitif seperti `password` dari object user sebelum dikembalikan.
6. **Return Data**: Kembalikan object data user ke pemanggil fungsi.

### Langkah 2: Buat Route API
1. Buka file `src/routes/user-routes.ts` (atau `user-route.ts`).
2. Tambahkan route baru `.post("/users/current", ...)` ke dalam instance Elysia.
3. Di dalam handler route, ekstrak header `Authorization` dari object request (bisa diakses melalui `headers.authorization`).
4. **Validasi Header**: 
   - Cek apakah header `authorization` ada.
   - Cek apakah formatnya diawali dengan kata `Bearer `. 
   - Jika tidak memenuhi, langsung kembalikan response error `401` dengan pesan "token not found".
5. **Ekstrak Token**: Pisahkan string "Bearer " untuk mendapatkan string `<token>` murni.
6. **Panggil Service**: Panggil fungsi `getCurrentUser(token)` yang dibuat di Langkah 1.
7. **Tangani Hasil**: 
   - Jika service mengembalikan data user, kirim response sukses (status 200) dengan struktur JSON yang diminta.
   - Jika service gagal (token tidak valid), kirim response error (status 401).

### Langkah 3: Pengujian
1. Jalankan server lokal dengan `bun run dev`.
2. Lakukan login terlebih dahulu melalui endpoint `/api/users/login` untuk mendapatkan `<token>`.
3. Buka Postman atau cURL.
4. Buat request `POST` ke `http://localhost:3000/api/users/current`.
5. Sisipkan header `Authorization` dengan value `Bearer <token_anda_di_sini>`.
6. Pastikan Anda mendapatkan balasan profile user Anda dengan pesan "success".
7. Uji juga dengan mengirim token yang salah atau tanpa header untuk memastikan error `unauthorized` ditangani dengan benar.
