# Implementasi Fitur Logout User

Dokumen ini berisi panduan teknis dan tahapan-tahapan yang diperlukan untuk mengimplementasikan fitur logout pengguna. Panduan ini dirancang agar mudah diikuti oleh programmer junior maupun AI pendamping.

## 1. Spesifikasi API Endpoint

Buat endpoint baru untuk melakukan proses logout user yang sedang aktif:
- **Metode HTTP**: `DELETE` 
- **Endpoint**: `/api/users/logout`

### Headers
API ini membutuhkan autentikasi melalui header untuk mengetahui sesi mana yang akan diakhiri:
- **Authorization**: `Bearer <token>` 
*(Catatan: `<token>` adalah token sesi yang tersimpan di tabel `sessions`)*.

### Response Sukses (JSON)
Jika token valid dan berhasil dihapus dari database, kembalikan response dengan HTTP Status 200:
```json
{
    "message": "success",
    "data": "Logout successful"
}
```
**Penting**: Jika respons sukses diberikan, pastikan baris data yang mengandung token tersebut **telah terhapus** dari tabel `sessions` di database.

### Response Error (JSON)
Jika header Authorization tidak ada, formatnya salah, atau token tidak ditemukan di database, kembalikan response HTTP Status 401 (Unauthorized):
```json
{
    "message": "unauthorized",
    "error": "token not found"
}
```

## 2. Struktur Folder dan File

Ikuti aturan penempatan file berikut di dalam folder `src/`:
- **`src/routes/`**: Tambahkan routing baru di file routing user yang sudah ada (misal: `user-routes.ts` atau `user-route.ts`).
- **`src/services/`**: Tambahkan fungsi untuk menghapus token di file service user (misal: `user-service.ts`).

---

## 3. Tahapan Implementasi (Step-by-Step)

Untuk mengimplementasikan fitur ini, ikuti langkah-langkah berurutan berikut:

### Langkah 1: Buat Logika Service (Business Logic)
1. Buka file `src/services/user-service.ts`.
2. Buat fungsi baru bernama `logoutUser(token)`.
3. **Pencarian Token**: Lakukan query ke database menggunakan Drizzle ORM untuk mencari apakah token tersebut ada di tabel `sessions`.
4. **Validasi**: Jika token tidak ditemukan, langsung kembalikan object gagal (misalnya `{ success: false }`).
5. **Hapus Sesi**: Jika token ditemukan, jalankan perintah `DELETE` ke database untuk menghapus baris data di tabel `sessions` yang memiliki token tersebut (`db.delete(sessions).where(...)`).
6. **Return Data**: Kembalikan object sukses (misalnya `{ success: true }`).

### Langkah 2: Buat Route API
1. Buka file `src/routes/user-routes.ts` (atau `user-route.ts`).
2. Tambahkan route baru `.delete("/users/logout", ...)` ke dalam instance Elysia.
3. Di dalam parameter handler, tambahkan konfigurasi validasi `headers` menggunakan `t.Object` agar properti `authorization` bertipe `t.String()`.
4. Di dalam fungsi handler, ekstrak header `authorization` (misal dari `headers['authorization']`).
5. **Validasi Header**: 
   - Cek apakah header tersebut diawali dengan kata `Bearer `. 
   - Jika tidak memenuhi syarat, kembalikan response error `401` dengan pesan "token not found".
6. **Ekstrak Token**: Pisahkan string "Bearer " untuk mendapatkan string `<token>` murni. Jangan lupa untuk melakukan pengecekan tambahan apakah token tersebut benar-benar ada (tidak undefined atau kosong).
7. **Panggil Service**: Panggil fungsi `logoutUser(token)` yang dibuat di Langkah 1.
8. **Tangani Hasil**: 
   - Jika service mengembalikan status berhasil, kirim response sukses (status 200) dengan pesan "Logout successful".
   - Jika service mengembalikan status gagal (token tidak valid/tidak ditemukan), kirim response error (status 401).

### Langkah 3: Pengujian
1. Jalankan server lokal dengan `bun run dev`.
2. Lakukan login melalui endpoint `POST /api/users/login` untuk mendapatkan `<token>`.
3. Buka Postman atau cURL.
4. Buat request `DELETE` ke `http://localhost:3000/api/users/logout`.
5. Sisipkan header `Authorization` dengan value `Bearer <token_anda_di_sini>`.
6. Pastikan Anda mendapatkan balasan "Logout successful".
7. Lakukan pengecekan di database (menggunakan Drizzle Studio atau CLI) untuk memastikan token tersebut sudah tidak ada lagi di tabel `sessions`.
8. Uji dengan melakukan request ulang menggunakan token yang sama; Anda harus mendapatkan error `unauthorized` karena token sudah terhapus.
