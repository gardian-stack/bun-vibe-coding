# Implementasi Swagger UI untuk Dokumentasi API

## Deskripsi Tugas
Tugas ini bertujuan untuk menambahkan antarmuka Swagger UI ke dalam proyek ini. Tujuannya adalah agar pengguna (user/developer) lain yang ingin menggunakan API pada aplikasi ini dapat dengan mudah melihat dokumentasi, payload yang dibutuhkan, dan langsung melakukan uji coba pemanggilan API (test endpoint) melalui browser.

Proyek ini dibangun menggunakan **Elysia.js**. Framework ini telah menyediakan plugin resmi untuk Swagger yang secara otomatis akan membaca skema validasi (TypeBox) yang sudah didefinisikan di setiap route.

---

## Tahapan Implementasi

Mohon ikuti instruksi berikut secara berurutan. Instruksi ini dirancang sangat mendetail agar mudah diikuti.

### Langkah 1: Instalasi Plugin Swagger
Elysia memiliki plugin bawaan resmi untuk Swagger. Langkah pertama adalah menginstal package tersebut ke dalam proyek.
Buka terminal/command prompt, pastikan berada di direktori *root* proyek, lalu jalankan perintah berikut:
```bash
bun add @elysiajs/swagger
```

### Langkah 2: Daftarkan Plugin di Entry Point
Buka file utama aplikasi, yaitu `src/index.ts`. Anda perlu mengimpor plugin swagger dan mendaftarkannya ke dalam instance Elysia.

**Detail Perubahan di `src/index.ts`:**
1. Di bagian paling atas file, tambahkan import untuk swagger:
   ```typescript
   import { swagger } from "@elysiajs/swagger";
   ```
2. Temukan baris di mana instance Elysia dibuat (biasanya `export const app = new Elysia()`).
3. Tambahkan `.use(swagger())` tepat sebelum pendaftaran route lainnya (sebelum `.use(userRoute)`). Anda juga bisa memberikan sedikit konfigurasi informasi dasar.

**Contoh Kode yang Diharapkan:**
```typescript
import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { userRoute } from "./routes/user-route";

export const app = new Elysia()
  // Tambahkan baris ini
  .use(swagger({
    documentation: {
      info: {
        title: 'Belajar Vibe Coding API Documentation',
        version: '1.0.0',
        description: 'Dokumentasi API untuk manajemen user'
      }
    }
  }))
  .use(userRoute)
  .get("/", () => ({
    message: "Hello Elysia!",
    status: "online",
  }))
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
```

### Langkah 3: Mengelompokkan Route dengan Tags (Opsional Tapi Sangat Disarankan)
Untuk membuat tampilan Swagger lebih rapi, buka file `src/routes/user-route.ts`. Tambahkan informasi deskriptif untuk setiap endpoint menggunakan properti `detail` di parameter ketiga pada deklarasi route.

**Contoh Penambahan pada Register Route:**
Ubah bagian validasi yang tadinya seperti ini:
```typescript
  }, {
    body: t.Object({
      username: t.String({ minLength: 3, maxLength: 50 }),
      email: t.String({ format: 'email', maxLength: 255 }),
      password: t.String({ minLength: 8, maxLength: 255 }),
    })
  })
```
Menjadi seperti ini:
```typescript
  }, {
    body: t.Object({
      username: t.String({ minLength: 3, maxLength: 50 }),
      email: t.String({ format: 'email', maxLength: 255 }),
      password: t.String({ minLength: 8, maxLength: 255 }),
    }),
    detail: {
      tags: ['Users'],
      summary: 'Register User Baru',
      description: 'Endpoint ini digunakan untuk mendaftarkan akun pengguna baru ke sistem.'
    }
  })
```
*(Lakukan hal yang mirip untuk endpoint login, get current, dan logout. Pastikan `tags: ['Users']` agar semuanya berada dalam satu kelompok di tampilan Swagger).*

### Langkah 4: Uji Coba (Testing)
Setelah selesai melakukan perubahan di atas, lakukan uji coba untuk memastikan Swagger berjalan dengan baik:
1. Jalankan aplikasi menggunakan perintah:
   ```bash
   bun run dev
   ```
2. Buka web browser (Chrome/Firefox/dsb).
3. Kunjungi URL: `http://localhost:3000/swagger`
4. Anda seharusnya melihat halaman dokumentasi Swagger UI dengan daftar API yang tersedia. Coba klik salah satu endpoint untuk melihat detail strukturnya.

---

## Kriteria Selesai (Acceptance Criteria)
1. Perintah `bun add @elysiajs/swagger` berhasil dijalankan.
2. Saat aplikasi dijalankan (`bun run dev`), URL `http://localhost:3000/swagger` dapat diakses dan menampilkan antarmuka Swagger UI.
3. Seluruh endpoint `/api/user`, `/api/users/login`, `/api/users/current`, dan `/api/users/logout` muncul di halaman Swagger beserta parameter/body yang dibutuhkan.
4. Kode tidak mengalami error atau *crash*.
