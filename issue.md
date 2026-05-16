# Perencanaan Implementasi Unit Test API

Dokumen ini berisi panduan untuk mengimplementasikan *Unit Testing* pada seluruh endpoint API menggunakan kerangka kerja pengujian bawaan dari Bun (`bun test`). 
Panduan ini dirancang cukup ringkas agar mudah dieksekusi oleh programmer junior maupun AI pendamping.

## 1. Tujuan dan Ruang Lingkup
- **Tujuan**: Memastikan semua API berfungsi sesuai ekspektasi (baik saat sukses maupun saat gagal).
- **Ruang Lingkup**: Menguji semua endpoint yang ada di aplikasi, yaitu:
  1. `POST /api/user` (Register)
  2. `POST /api/users/login` (Login)
  3. `POST /api/users/current` (Get Current User)
  4. `DELETE /api/users/logout` (Logout)

## 2. Struktur Direktori
Buat sebuah folder baru bernama `test` di root proyek (atau sejajar dengan `src`). Seluruh file test harus berada di dalam folder ini.
Contoh struktur file:
```
/test
 ├── user-register.test.ts
 ├── user-login.test.ts
 ├── user-current.test.ts
 └── user-logout.test.ts
```
Atau Anda bisa menggabungkannya ke dalam satu file `user.test.ts` sesuai preferensi.

---

## 3. Aturan Main (Wajib Diikuti)

1. **Gunakan `bun test`**: Tulis semua test menggunakan fitur bawaan Bun, seperti `describe`, `it`, dan `expect`.
2. **Setup Server**: Anda bisa melakukan *mocking* request ke instance Elysia kita menggunakan metode bawaan Elysia seperti `app.handle(new Request(...))`.
3. **Pembersihan Data (Konsistensi)**: 
   - **Wajib** membersihkan (menghapus) data terkait dari database **sebelum** setiap *test case* dijalankan. 
   - Gunakan blok `beforeEach` atau `beforeAll` untuk menjalankan query `delete` ke tabel `users` dan `sessions` menggunakan Drizzle. Tujuannya agar setiap skenario dimulai dengan database yang bersih dan tidak saling mengganggu.

---

## 4. Skenario Pengujian (Test Cases)

Silakan implementasikan skenario pengujian berikut secara menyeluruh:

### A. Endpoint Register (`POST /api/user`)
- **Sukses**: Mendaftar dengan data lengkap dan valid. Pastikan mendapat status HTTP 200 dan pesan sukses. Pastikan password tersimpan dalam bentuk *hash*.
- **Gagal (Username kembar)**: Mendaftar menggunakan username yang sudah ada di database. Pastikan mendapat error yang relevan.
- **Gagal (Validasi Input)**: Mendaftar dengan username lebih dari 50 karakter atau email yang formatnya salah. Pastikan mendapat error validasi.

### B. Endpoint Login (`POST /api/users/login`)
- **Sukses**: Login dengan kredensial yang benar. Pastikan respons mengembalikan *token* dan data user (tanpa password). Pastikan *token* tersimpan di tabel `sessions`.
- **Gagal (Username salah)**: Login dengan username yang tidak terdaftar. Pastikan mendapat respons 401 Unauthorized.
- **Gagal (Password salah)**: Login dengan username benar tetapi password salah. Pastikan mendapat respons 401 Unauthorized.

### C. Endpoint Get Current User (`POST /api/users/current`)
- **Sukses**: Meminta data user menggunakan *Bearer token* yang valid (buat tokennya secara manual/otomatis di dalam test). Pastikan mendapat respons data user terkait.
- **Gagal (Token tidak valid)**: Mengirim request dengan token acak/salah. Pastikan ditolak dengan 401 Unauthorized.
- **Gagal (Tanpa Token)**: Mengirim request tanpa menyertakan header Authorization. Pastikan ditolak dengan 401 Unauthorized.

### D. Endpoint Logout (`DELETE /api/users/logout`)
- **Sukses**: Mengirim request logout dengan token valid. Pastikan mendapat respons sukses dan **penting**: pastikan token tersebut benar-benar *hilang/terhapus* dari tabel `sessions` di database.
- **Gagal (Token tidak valid/Tanpa Token)**: Mengirim request dengan token salah atau tanpa token sama sekali. Pastikan ditolak dengan 401 Unauthorized.

---

Silakan ikuti *checklist* skenario di atas dan buat kodenya senatural mungkin menggunakan fungsi bawaan `bun test`.
