# Laporan Bug: Validasi Input Kurang pada Endpoint Register User

Dokumen ini berisi detail bug terkait kurangnya validasi panjang data pada endpoint pendaftaran pengguna (`POST /api/user`) dan panduan langkah demi langkah untuk memperbaikinya. Panduan ini dirancang agar mudah diikuti oleh programmer junior maupun AI pendamping.

## 1. Deskripsi Bug

Saat ini, fungsi register (`POST /api/user`) mengizinkan pengguna untuk mengirimkan data `username`, `email`, dan `password` dengan panjang tak terbatas. 

Namun, skema database kita (di `src/db/schema.ts`) memiliki batasan panjang untuk kolom-kolom tersebut:
- `username`: maksimal 50 karakter (`varchar(50)`)
- `email`: maksimal 255 karakter (`varchar(255)`)
- `password`: maksimal 255 karakter (`varchar(255)`)

**Masalah:** 
Jika pengguna mengirimkan data yang melebihi batas tersebut (misalnya, `username` dengan 300 karakter), database akan menolak query *insert* dengan error seperti `Data too long for column`. Hal ini menyebabkan endpoint merespons dengan generic error `{"error": "gagal membuat user"}` tanpa memberi tahu pengguna alasan spesifiknya, dan memberikan beban pemrosesan yang tidak perlu ke database.

## 2. Ekspektasi Perbaikan

Framework Elysia yang kita gunakan sudah memiliki fitur validasi bawaan (`elysia/t`). Kita perlu menambahkan aturan pembatasan di dalam skema validasi *body* pada endpoint `/api/user`. 

Ekspektasi sistem setelah diperbaiki:
- Jika `username` lebih dari 50 karakter, sistem akan langsung menolak request dengan status HTTP 400 (Bad Request) atau 422 (Unprocessable Entity) beserta pesan validasi dari Elysia. Data tidak akan diteruskan ke database.
- Demikian juga untuk batasan panjang `email` dan format standar email.

---

## 3. Tahapan Implementasi Perbaikan (Step-by-Step)

Berikut adalah panduan untuk memperbaikinya:

### Langkah 1: Periksa Skema Validasi Saat Ini
1. Buka file routing API untuk user, yaitu `src/routes/user-route.ts`.
2. Temukan blok kode untuk endpoint pendaftaran pengguna (`.post("/user", ...)`).
3. Perhatikan bagian konfigurasi skema *body* di parameter kedua handler tersebut:
   ```typescript
   body: t.Object({
     username: t.String(),
     email: t.String(),
     password: t.String(),
   })
   ```

### Langkah 2: Tambahkan Aturan Validasi Panjang String
1. Modifikasi skema `t.String()` di atas dengan memberikan opsi batas minimum dan maksimum panjang string.
2. Ubah kodenya menjadi seperti berikut:
   ```typescript
   body: t.Object({
     username: t.String({ minLength: 3, maxLength: 50 }),
     email: t.String({ format: 'email', maxLength: 255 }),
     password: t.String({ minLength: 8, maxLength: 255 }),
   })
   ```
   *Catatan:*
   - `maxLength: 50` pada username akan mencegah pengiriman nama lebih dari 50 karakter (sesuai batasan `varchar(50)` di database).
   - `format: 'email'` memastikan input harus berupa format email yang valid.
   - `minLength` adalah bonus tambahan agar data yang masuk tidak terlalu pendek atau asal.

### Langkah 3: Lakukan Pengujian (Testing)
1. Jalankan server lokal menggunakan perintah:
   `bun run dev`
2. Buka Postman, cURL, atau alat penguji API lainnya.
3. Lakukan request `POST` ke `http://localhost:3000/api/user` dengan menyertakan payload JSON di *body*.
4. **Skenario Uji 1 (Kelebihan Karakter):** Kirim payload di mana `username` berisi lebih dari 50 karakter huruf secara acak.
5. **Hasil yang Diharapkan:** Server harus mengembalikan respons gagal (seperti Bad Request) dan menyertakan deskripsi error spesifik dari Elysia tentang panjang `username` yang melebihi batas. Sistem TIDAK boleh merespons dengan pesan generic `"gagal membuat user"`.
6. **Skenario Uji 2 (Email Tidak Valid):** Kirim format email yang salah (misalnya, `email: "bukanemail"`). Server juga harus menolaknya berkat atribut `format: 'email'`.

Setelah Anda memastikan perubahan tersebut bekerja dan menangkap data salah pada lapisan terluar API, simpan (commit) pekerjaan Anda dan ajukan *Pull Request* baru!
