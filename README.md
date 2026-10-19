# Andalusia DISC Sales Battle — Senario 01

Live Battle percubaan untuk WhatsApp, Rescue Card, DISC, dua Live Closing dan bonus pada leaderboard yang sama.

## Jalankan melalui Render
- Web Service -> repository ini
- Runtime: Node
- Build command: `npm install`
- Start command: `npm start`
- Environment variable: `TRAINER_PIN` = PIN peribadi yang kuat (jangan masukkan dalam kod)

Pelayan menggunakan PORT daripada hosting. Buka halaman utama untuk pilihan Trainer dan Peserta. Trainer membuka lobi dan memaparkan QR; peserta menyertai melalui telefon.

**Had versi percubaan:** Sesi dan skor hanya disimpan dalam memori pelayan. Jika server restart/sleep/deploy, markah akan hilang. Jangan gunakan untuk kursus sebenar tanpa pangkalan data kekal. Repositori sebaiknya Private.

**Pengajaran:** Jawapan A/B/C ialah B dan watak latihan menunjukkan DISC D. Bonus Live Closing maksimum 20 seorang.
