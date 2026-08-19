# Kalkulator Lancar Jaya

Sistem kalkulasi biaya handling perjalanan dan pembuatan proposal penawaran harga untuk klien PT Lancar Jaya.

Aplikasi ini menjembatani hubungan bisnis antara **Muthowif** (penyedia jasa handling/penyedia LA) dengan **Agent Travel Umrah** (klien). 
- **Muthowif** (Admin/Superadmin) bertindak sebagai pengelola tarif dasar dan overhead pada katalog parameter.
- **Agent Travel Umrah** (User/Client) bertindak sebagai pengguna kalkulator yang memilih layanan mana saja yang diperlukan, menyesuaikan volume jama'ah/pax, dan menyimpan proposal harga jual untuk paket mereka.

## Language

**Paket**:
Tipe paket penawaran perjalanan yang menentukan lingkup penanganan (handling) default oleh tim. Terdiri dari tiga jenis: Grup Besar (>= 16 pax, handling penuh), Esensial (<= 15 pax, handling hotel saja), dan Lengkap (<= 15 pax, handling penuh).
_Avoid_: Tipe trip, kategori perjalanan

**Pax**:
Jumlah jama'ah atau peserta dalam satu grup perjalanan yang diajukan oleh Agent Travel Umrah, menjadi basis pengali biaya per pax.
_Avoid_: Jama'ah, client count, peserta

**Level Fee**:
Tingkatan pengali tarif freelancer bandara/hotel dan biaya bellboy berdasarkan jumlah Pax (L1, L2, L3, L4).
_Avoid_: Tiering, pengali pax

**Layanan Inti**:
Layanan utama penyediaan handling bandara/hotel dan Muthowif. Secara bawaan aktif berdasarkan tipe Paket, namun dapat dinonaktifkan secara dinamis oleh Agent Travel Umrah jika tidak diperlukan.
_Avoid_: Core service, biaya wajib

**Layanan Pilihan**:
Layanan tambahan opsional yang dapat diaktifkan atau dimasukkan manual ke dalam kalkulator (misal: katering, sewa transmitter, fotografer).
_Avoid_: Optional service, add-on

**Direct Cost**:
Akumulasi biaya langsung dari seluruh Layanan Inti dan Layanan Pilihan yang aktif sebelum ditambah overhead.
_Avoid_: Biaya kotor, raw cost

**Overhead & Buffer**:
Persentase biaya tambahan (umumnya default 10%) untuk menutupi biaya operasional kantor (overhead) dan risiko fluktuasi biaya lapangan (buffer).
_Avoid_: Mark-up, biaya tak terduga

**Full Cost**:
Total biaya dasar grup setelah mengakumulasikan Direct Cost dengan Overhead & Buffer. Menjadi basis untuk menghitung Harga Jual berdasarkan margin.
_Avoid_: Net cost, cost price

**Margin**:
Persentase keuntungan yang ditargetkan dari Harga Jual (rumus: `Harga Jual = Full Cost / (1 - Margin)`).
_Avoid_: Profit percentage, markup rate

**Harga Jual**:
Harga penawaran akhir per pax atau per grup yang ditagihkan kepada klien.
_Avoid_: Selling price, proposal price, rate penawaran

**Proposal**:
Hasil kalkulator berupa rincian penawaran harga jual dan cost yang disimpan secara resmi oleh Admin/Superadmin untuk dilihat detailnya atau dicetak.
_Avoid_: Quote, penawaran harga

**Profit**:
Selisih antara Harga Jual grup dengan Full Cost grup yang menjadi proyeksi pendapatan bersih perusahaan.
_Avoid_: Revenue, keuntungan kotor
