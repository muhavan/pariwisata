# UMKM & EKRAF Dinas Parawisata Tangsel

Platform informasi UMKM dan Ekonomi Kreatif Kota Tangerang Selatan.

## Fitur Utama

### Untuk Pengunjung (Public)
- **Beranda**: Menampilkan 5 UMKM unggulan, 3 destinasi wisata, dan 3 berita terbaru
- **Data UMKM**: Halaman lengkap dengan semua UMKM yang terverifikasi, dilengkapi pencarian dan filter kategori
- **Destinasi Wisata**: Galeri destinasi wisata dengan pencarian dan filter
- **Berita**: Daftar lengkap berita dan kegiatan terbaru
- **Pengajuan UMKM**: Form untuk UMKM baru mengajukan diri ke platform
- **Kontak**: Informasi kontak dan lokasi kantor

### Untuk Admin (Portal Admin)
- Login dengan kredensial admin
- Dashboard untuk mengelola:
  - UMKM (melihat pengajuan, approve/reject)
  - Destinasi Wisata (tambah, edit, hapus)
  - Berita (tambah, edit, hapus)
  - Anggota/Member (kelola data anggota)
- Upload foto untuk UMKM dan destinasi

## Struktur Folder

\`\`\`
.
├── index.html                 # Halaman beranda
├── data-umkm.html            # Halaman data UMKM lengkap
├── destinasi-wisata.html     # Halaman destinasi wisata
├── berita.html               # Halaman berita
├── login.html                # Halaman login admin
├── admin/
│   ├── dashboard.html        # Dashboard admin
│   ├── css/
│   ├── js/
├── routes/
│   ├── umkm.js              # API untuk UMKM
│   ├── wisata.js            # API untuk destinasi wisata
│   ├── berita.js            # API untuk berita
│   ├── admin.js             # API untuk admin
│   ├── auth.js              # API untuk autentikasi
│   └── upload.js            # API untuk upload file
├── css/
│   ├── style.css            # Style utama
│   └── responsive.css       # Style responsive
├── js/
│   ├── main.js              # JavaScript utama
│   ├── data-umkm.js         # Script halaman data UMKM
│   ├── destinasi-wisata.js  # Script halaman destinasi
│   └── berita.js            # Script halaman berita
├── config/
│   └── database.js          # Konfigurasi database
├── database/
│   └── schema.sql           # Schema database
└── server.js                # File server Express
\`\`\`

## Fitur Halaman

### Halaman Beranda (index.html)
- Hero section dengan CTA
- 5 UMKM unggulan dalam tabel
- 3 Destinasi wisata dalam grid
- 3 Berita terbaru dalam grid
- Form pengajuan UMKM
- Informasi kontak

### Halaman Data UMKM (data-umkm.html)
- Tabel lengkap semua UMKM terverifikasi
- Search/pencarian UMKM
- Filter berdasarkan kategori
- Pagination
- Responsive design

### Halaman Destinasi Wisata (destinasi-wisata.html)
- Grid destinasi wisata
- Search/pencarian destinasi
- Filter berdasarkan kategori
- Pagination
- Responsive design

### Halaman Berita (berita.html)
- Grid berita dan kegiatan
- Search/pencarian berita
- Pagination
- Format tanggal Indonesia
- Responsive design

## API Routes

### UMKM
- `GET /api/umkm` - Daftar UMKM terverifikasi (parameter: limit, category)
- `GET /api/umkm/:id/submission-photos` - Foto pengajuan UMKM
- `POST /api/umkm/submit` - Submit pengajuan UMKM
- `POST /api/umkm/:id/approve` - Approve pengajuan (admin)
- `POST /api/umkm/:id/reject` - Reject pengajuan (admin)

### Destinasi Wisata
- `GET /api/wisata` - Daftar destinasi (parameter: limit, kategori)
- `GET /api/wisata/:id` - Detail destinasi
- `POST /api/wisata` - Tambah destinasi (admin)
- `PUT /api/wisata/:id` - Update destinasi (admin)
- `DELETE /api/wisata/:id` - Hapus destinasi (admin)

### Berita
- `GET /api/berita` - Daftar berita (parameter: limit)
- `GET /api/berita/:id` - Detail berita
- `POST /api/berita` - Tambah berita (admin)
- `PUT /api/berita/:id` - Update berita (admin)
- `DELETE /api/berita/:id` - Hapus berita (admin)

## Teknologi yang Digunakan

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **File Upload**: Base64 encoding

## Cara Menjalankan

1. Install dependencies
   \`\`\`bash
   npm install
   \`\`\`

2. Setup database
   \`\`\`bash
   mysql -u root < database/schema.sql
   \`\`\`

3. Konfigurasi environment (.env)
   \`\`\`
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=si_umkm_ekraf
   PORT=5000
   \`\`\`

4. Jalankan server
   \`\`\`bash
   node server.js
   \`\`\`

5. Buka browser dan akses `http://localhost:5000`

## Kredensial Admin Default

Login admin dapat diakses di halaman login dengan kredensial yang sudah disiapkan di database.

## Catatan Penting

- Semua UMKM yang ditampilkan di halaman publik harus sudah terverifikasi (status = 'approved')
- Homepage menampilkan maksimal 5 UMKM, 3 destinasi, dan 3 berita
- Halaman detail menampilkan semua data dengan pagination
- Semua foto disimpan dalam format Base64
- Database menggunakan MySQL dengan collation utf8mb4_unicode_ci

## Support

Untuk bantuan, hubungi melalui:
- Email: info@si-umkm-tangsel.id
- WhatsApp: https://wa.me/6281234567890
