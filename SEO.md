# SEO Brandingku — status & checklist

Terakhir diperbarui: 14 November 2026. Audit data diambil langsung dari API production (99 produk aktif, 8 kategori induk).

Centang `[x]` kalau sudah beres.

---

## 1. Sudah dikerjakan (kode)

- [x] Detail produk, detail kategori, dan portfolio dirender di server (SSR). Google dan preview link WA/Facebook langsung dapat isi halaman.
- [x] Title, meta description, Open Graph, Twitter card, dan canonical di semua halaman publik (`composables/usePageSeo.ts`).
- [x] JSON-LD `Product` + `BreadcrumbList` di detail produk. `offers` (harga) otomatis muncul begitu harga produk diisi.
- [x] JSON-LD `Organization` + `WebSite` di homepage dan `/kontak` (`composables/useOrganizationSchema.ts`). Data kontak diambil dari menu Options di console.
- [x] `/sitemap.xml` dinamis: halaman statis, kategori induk, semua produk aktif, dan portfolio aktif, lengkap dengan `lastmod`.
- [x] `/robots.txt` dinamis: memblokir `/console/`, `/api/`, `/test/`, `/profile/`, `/wishlist`, dan menunjuk ke sitemap.
- [x] Produk dan kategori yang tidak ada mengembalikan HTTP 404 (bukan soft-404).
- [x] Title dan description kategori sekarang berbahasa Indonesia dan memuat keyword ("Tumbler Custom Logo - Brandingku"). Template bahasa Inggris dari API ("Premium X - Corporate Solutions") tidak dipakai lagi.
- [x] Daftar produk di `/product` dan halaman kategori: halaman pertama dirender di server, jadi link ke produk bisa di-crawl.

---

## 2. Langkah setelah deploy (sekali saja)

- [ ] **Pastikan deploy jalan.** Per 14 Nov, `https://brandingku.my.id/sitemap.xml` masih 404, artinya kode baru belum live. Cek tab Actions di GitHub (workflow `nuxthub.yml`) atau deploy manual dengan `pnpm run deploy:cf`.
- [ ] Buka `https://brandingku.my.id/sitemap.xml` dan `https://brandingku.my.id/robots.txt`, pastikan isinya muncul.
- [ ] **Google Search Console** (https://search.google.com/search-console):
  - Tambah property domain `brandingku.my.id` (verifikasi lewat DNS TXT di Cloudflare).
  - Menu *Sitemaps* → submit `https://brandingku.my.id/sitemap.xml`.
  - *URL Inspection* → minta indexing untuk homepage dan 5–10 produk paling penting.
- [ ] **Bing Webmaster Tools** (https://www.bing.com/webmasters): import dari Search Console, lalu submit sitemap. Ini sekaligus mencakup Yahoo dan DuckDuckGo.
- [ ] Tes 1–2 URL produk di **Rich Results Test** (https://search.google.com/test/rich-results). Harus terdeteksi *Product snippets* dan *Breadcrumbs*.
- [ ] Tes preview link: tempel URL produk di WhatsApp atau https://www.opengraph.xyz. Gambar dan judulnya harus muncul.

---

## 3. Data yang perlu kamu update di console (dampak terbesar)

### 3.1 Harga produk — WAJIB
- [ ] **99 dari 99 produk aktif belum punya harga.** Tanpa harga, Google tidak menampilkan harga atau rich result di hasil pencarian, dan schema `Product` dianggap kurang lengkap.
  - Isi harga di *Additionals* tiap produk (harga per pcs, plus tier grosir).
  - Kalau harga memang "by request", tetap isi harga mulai dari (harga terendah) supaya bisa tampil "Mulai Rp xx.xxx".

### 3.2 Kategori induk yang kosong — PENTING
Struktur kategori sekarang dobel. Kategori lama **`usb`, `powerbank`, `mug`, dan `atk`** tidak berisi produk sama sekali, karena produknya ada di sub kategori **Gadget** (USB Flashdrive, Powerbank, Coffee Cup, dll) dan **Stationary** (Agenda, Notebook, Pen). Hanya `tumbler` (6), `gadget` (64), `payung` (5), dan `stationary` (24) yang ada isinya.

Halaman kategori kosong dinilai Google sebagai halaman tipis, dan itu menurunkan kualitas situs secara keseluruhan. Sitemap sudah otomatis melewati kategori kosong, tapi halamannya masih bisa diakses dari menu.

- [ ] Pilih salah satu: **nonaktifkan** keempat kategori lama, **atau** pindahkan produk ke sana supaya strukturnya tidak dobel.
- [ ] Kalau dinonaktifkan, cek menu navbar dan landing page supaya tidak ada link ke kategori yang mati.
- [ ] Rapikan huruf besar nama kategori. `mug`, `powerbank`, dan sub kategori seperti `arden`, `gelas`, `ceramic` masih huruf kecil, dan nama ini langsung dipakai di title halaman ("mug Custom Logo - Brandingku").

### 3.3 Deskripsi kategori
Deskripsi kategori tampil di halaman kategori dan dipakai sebagai meta description. Kalau isinya di bawah 70 karakter, sistem memakai kalimat template.

| Kategori | Panjang deskripsi sekarang | Status |
|---|---|---|
| tumbler | 53 karakter | [ ] tulis ulang |
| powerbank | 21 karakter | [ ] tulis ulang |
| gadget | kosong | [ ] tulis |
| mug | 15 karakter | [ ] tulis ulang |
| atk | 16 karakter | [ ] tulis ulang |
| payung | kosong | [ ] tulis |
| stationary | kosong | [ ] tulis |
| usb | 7 karakter | [ ] tulis ulang |

Panduan menulis (per kategori 150–300 kata):
- Paragraf pembuka: apa produknya, untuk siapa (kantor, event, seminar, souvenir), dan keyword utama. Contoh: *"Tumbler custom logo untuk souvenir kantor dan corporate gift…"*
- Pilihan bahan/model yang tersedia.
- Teknik branding yang cocok (sablon, laser engrave, UV print, dll).
- Minimum order, estimasi pengerjaan, dan cakupan pengiriman.
- Keyword turunan secara natural: "murah", "grosir", "satuan", "Jakarta", "untuk seminar".

### 3.4 Sub kategori
- [ ] Ke-33 sub kategori belum punya deskripsi (mis. sub di tumbler 8, gadget 8, usb 4). Isi minimal 1–2 kalimat.

### 3.5 Gambar kategori
- [ ] Cover halaman detail belum ada untuk: powerbank, gadget, mug, atk, payung, stationary.
- [ ] Gambar daftar (banner) belum ada untuk: gadget, payung, stationary.
  Gambar ini juga dipakai sebagai preview link (og:image) halaman kategori.

### 3.6 Produk
- [ ] **NBLT01** dan **NBLT02** memakai deskripsi yang sama. Bedakan isinya, karena konten duplikat melemahkan keduanya.
- [ ] Sebaran produk timpang: USB Flashdrive 42 produk, sementara Mug/Coffee Cup cuma 1, Payung Golf 1, Wireless Charger 1. Tambah produk di kategori yang tipis supaya halaman kategorinya layak ranking.
- [ ] Nama produk: pakai pola *jenis + fitur pembeda + kapasitas/ukuran* (sudah bagus di contoh "Tas Lipat Anti Air Tahan Beban 8kg"). Hindari nama yang cuma kode.
- [ ] Alt text gambar mengikuti nama produk, jadi cukup pastikan nama produk deskriptif.

### 3.7 Portfolio
- [ ] Baru ada **1 portfolio**. Target 10–20: tiap proyek klien (foto hasil, klien, produk, teknik branding). Ini bukti kerja nyata sekaligus konten untuk pencarian "merchandise [industri/klien]".
- [ ] Subtitle portfolio dipakai sebagai meta description. Tulis 1–2 kalimat, bukan cuma nama teknik ("Engrave Laser").

---

## 4. Di luar website (sering lebih berpengaruh dari kode)

- [ ] **Google Business Profile** (https://business.google.com): daftarkan Brandingku dengan alamat, jam buka, nomor WA, foto produk, dan link website. Ini wajib supaya muncul di Maps dan di pencarian lokal ("merchandise jakarta").
- [ ] Minta **review Google** dari klien setelah order selesai (kirim link review lewat WA). Target 20+ review.
- [ ] **Backlink yang wajar**:
  - Profil Tokopedia/Shopee/Instagram/LinkedIn yang menautkan ke brandingku.my.id.
  - Direktori bisnis Indonesia (Indonetwork, Yellow Pages ID, dsb).
  - Minta klien atau partner event mencantumkan link "merchandise oleh Brandingku".
- [ ] **Jangan** beli backlink massal, pakai bot trafik, atau bot klik. Semuanya melanggar spam policy Google dan bisa berujung penalti.

---

## 5. Konten rutin (setelah data di atas beres)

Target 2–4 artikel per bulan, tiap artikel menautkan ke 2–3 kategori atau produk terkait. Contoh topik:
- [ ] Ide corporate gift akhir tahun untuk karyawan dan klien
- [ ] Sablon vs bordir vs laser engrave vs UV print: mana yang cocok untuk produk apa
- [ ] Rekomendasi seminar kit dan goodie bag acara kantor
- [ ] Panduan menyiapkan file logo untuk dicetak (format, resolusi)
- [ ] Harga cetak logo di tumbler/powerbank/flashdisk: faktor yang memengaruhi

> Fitur blog belum ada di website. Kalau mau mulai menulis artikel, minta dibuatkan dulu (halaman `/artikel` + editor di console).

---

## 6. Pekerjaan teknis berikutnya (opsional, belum dikerjakan)

- [ ] **Konten homepage dirender di server.** Section produk unggulan, benefit, klien, dan sejenisnya sekarang baru dimuat saat di-scroll (intersection observer). Akibatnya HTML awal homepage tidak berisi satu pun link produk.
- [ ] **Pagination daftar produk bisa di-crawl.** Sekarang hanya halaman 1 (10 produk) yang dirender di server, dan pindah halaman cuma lewat tombol. Produk lain tetap ditemukan lewat sitemap, tapi link `?page=2` akan membantu internal linking.
- [ ] **Gambar OG default 1200×630.** Sekarang fallback-nya memakai logo loading 612×612. Siapkan desainnya, nanti tinggal dipasang.
- [ ] **Audit kecepatan (Core Web Vitals):** ukuran gambar produk, LCP homepage, dan font Google yang dimuat dari komponen FAQ.
- [ ] **IndexNow:** ping otomatis ke Bing/Yandex setiap produk dibuat atau diubah. Paling rapi dipasang di backend Go.
- [ ] **Slug produk berisi keyword** (mis. `tas-lipat-anti-air-fsb01`, bukan `FSB01`). Efeknya kecil, dan butuh redirect 301 dari URL lama. Pertimbangkan hanya kalau URL lama belum banyak terindeks.
- [ ] **Versi bahasa Inggris terindeks:** sekarang hanya bahasa Indonesia yang terindeks (satu URL untuk dua bahasa). Cukup kalau targetnya pasar lokal.
- [ ] **Backend:** `meta_title`/`meta_description` kategori di API masih template bahasa Inggris hardcoded (`brandingku_go/graph/schema.resolvers.go`). Frontend sudah tidak memakainya. Kalau mau bisa diatur per kategori, perlu kolom di database + input di form console.

---

## 7. Ekspektasi & cara memantau

- Indexing awal: 1–4 minggu setelah sitemap di-submit.
- Keyword spesifik (mis. "tumbler custom logo jakarta"): biasanya mulai naik dalam 3–6 bulan, asal konten dan review rutin bertambah.
- Keyword umum (mis. "merchandise"): bisa lebih dari 12 bulan dan butuh backlink kuat.
- Pantau tiap bulan di Search Console → *Performance*: impressions, klik, posisi rata-rata, dan query apa saja yang mendatangkan pengunjung. Query yang sudah dapat impression tapi posisinya 8–20 adalah kandidat untuk diperkuat (tambah konten atau link internal).
