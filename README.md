# `ArenaKita` - Web Booking Tempat Olahraga (Front End)

<div align="center">
  <img src="https://skillicons.dev/icons?i=tailwind,ts,react,nextjs,pnpm" alt="Tech Skills" />
</div>

## 📝 Deskripsi Proyek

Proyek **ArenaKita** adalah pengembangan sisi *Front End* untuk *platform* berbasis web yang memfasilitasi *booking* dan penyewaan tempat olahraga (seperti lapangan futsal, bulu tangkis, tenis, dll.). Proyek ini dikembangkan sebagai tugas mata kuliah **Front End** dan **Back End**.

**Tujuan:** Menyediakan antarmuka pengguna (UI) yang cepat, intuitif, dan responsif bagi pengguna untuk mencari, melihat detail, melakukan pemesanan, dan mengelola sewa tempat olahraga secara *online*.

## 🛠️ Tech Stack & Dependencies

Proyek ini diinisialisasi menggunakan *recommended defaults* dari Next.js, memastikan performa dan pengalaman pengembang yang optimal.

| Kategori | Teknologi | Konfigurasi |
| :--- | :--- | :--- |
| **Framework** | **Next.js** | App Router, Default Next.js Structure |
| **Bahasa** | **TypeScript** | **Yes** (Memberikan *static typing*) |
| **Styling** | **Tailwind CSS** | **Yes** (Untuk *styling* cepat dan responsif) |
| **Linter** | **ESLint** | **Yes** (Standar kualitas kode) |
| **Compiler** | **Turbopack** | **Yes** (Meningkatkan kecepatan *development*) |
| **Package Manager**| **pnpm** | Digunakan untuk manajemen *dependencies* |

## 🚀 Instalasi dan Menjalankan Proyek

Pastikan Anda telah menginstal **Node.js** (versi 18+) dan **pnpm** di sistem Anda.

### 1\. Kloning Repositori

```bash
git clone [URL_REPOSITORI_ANDA]
cd arenakita
```

### 2\. Instalasi Dependencies

Gunakan `pnpm` untuk instalasi semua *dependencies* proyek:

```bash
pnpm install
```

### 3\. Menjalankan Server Pengembangan

Proyek akan dijalankan di mode pengembangan (*development mode*) pada `http://localhost:3000`.

```bash
pnpm run dev
```

### 4\. Build dan Start (Produksi)

Untuk simulasi *build* dan menjalankan mode produksi:

```bash
# Membuat build optimasi
pnpm run build
# Menjalankan server yang sudah di-build
pnpm run start
```

-----

## 🤝 Panduan Kolaborasi (Git & GitHub)

Kami menggunakan model kolaborasi **Feature Branch Workflow** dengan *staging branch* untuk memastikan stabilitas kode sebelum di-*deploy* ke lingkungan utama (*main*).

### 1\. Konvensi Penamaan Branch

Setiap tugas atau perubahan harus dibuat dalam *branch* baru dari `main` dengan *prefix* yang jelas:

| Prefix | Tujuan | Contoh |
| :--- | :--- | :--- |
| `feat/` | Pengembangan Fitur Baru. | `feat/halaman-lapangan-detail`, `feat/implementasi-login-form` |
| `fix/` | Perbaikan *Bug* (kesalahan). | `fix/form-tanggal-error`, `fix/navbar-mobile-bug` |
| `refactor/` | Perubahan kode yang tidak mengubah perilaku (*cleanup*). | `refactor/membersihkan-component-unused`, `refactor/upgrade-typescript` |
| `docs/` | Perubahan pada dokumentasi saja (seperti README). | `docs/update-readme-kontak` |

### 2\. Alur Kerja Kolaborasi (Wajib Diikuti)

Berikut adalah langkah-langkah yang harus diikuti oleh setiap anggota tim:

#### A. Persiapan Awal

1.  **Sinkronisasi:** Selalu mulai dengan memastikan *branch* lokal Anda (`main`) adalah yang terbaru dari GitHub.
    ```bash
    git checkout main
    git pull origin main
    ```

#### B. Pengerjaan Tugas

2.  **Buat Branch Baru:** Buat *branch* baru dari `main` sesuai konvensi di atas.
    ```bash
    git checkout -b feat/nama-fitur-anda
    ```
3.  **Lakukan Pekerjaan:** Lakukan perubahan kode, dan *commit* secara berkala dengan pesan yang deskriptif.

#### C. Review dan Staging

4.  **Push Branch:** *Push* *branch* baru Anda ke GitHub.
    ```bash
    git push origin feat/nama-fitur-anda
    ```
5.  **Buat Pull Request (PR) ke `staging`:**
      * Buka GitHub dan buat *Pull Request* (PR) dari `feat/nama-fitur-anda` **ke** *branch* tujuan **`staging`**.
      * *Assign* setidaknya satu rekan tim sebagai *reviewer*.
6.  **Review & Merge ke `staging`:** Setelah PR di-*approve* oleh *reviewer* (memastikan tidak ada *bug* atau *error*), *merge* PR tersebut ke *branch* **`staging`**.
      * *(Branch* `staging` akan digunakan untuk pengujian integrasi dengan Back End atau *QA test*.)\*

#### D. Deployment ke Main

7.  **Merge dari `staging` ke `main`:**
      * Setelah semua fitur di `staging` teruji dengan baik dan stabil, buat PR baru dari **`staging`** **ke** **`main`**.
      * *Branch* `main` hanya di-*update* dari `staging` dan harus selalu mencerminkan kode yang siap produksi.

### 3\. Pesan Commit (Contoh)

Pesan *commit* harus informatif:

```bash
# Contoh commit untuk fitur baru
git commit -m "feat: Menambahkan layout dasar halaman detail lapangan"

# Contoh commit untuk perbaikan bug
git commit -m "fix: Memperbaiki isu validasi form login yang tidak bekerja"
```