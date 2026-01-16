import { supabase, isSupabaseConfigured } from '../supabaseClient';
import type { Ticket, Announcement, WeatherLog, Location, LocationHistory, LocationFormData, HourlyForecast } from '../types';

// Data Mock dari CSV user
const MOCK_CSV_DATA: Ticket[] = [
  { id: 'Tiket.0001', tanggal: '2026-01-02', jam_masuk: '19:27', jam_keluar: '19:32', nopol: 'BD 8259 W', netto: 5000, janjang: 417, lokasi: 'AFD A NASAL' },
  { id: 'Tiket.0002', tanggal: '2026-01-03', jam_masuk: '11:13', jam_keluar: '11:18', nopol: 'BD 9737 AR', netto: 450, janjang: 35, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0003', tanggal: '2026-01-03', jam_masuk: '14:25', jam_keluar: '14:32', nopol: 'BD 8259 W', netto: 680, janjang: 45, lokasi: 'AFD E NASAL' },
  { id: 'Tiket.0004', tanggal: '2026-01-03', jam_masuk: '14:56', jam_keluar: '15:03', nopol: 'BD 8261 W', netto: 1820, janjang: 95, lokasi: 'AFD A NASAL' },
  { id: 'Tiket.0005', tanggal: '2026-01-03', jam_masuk: '15:10', jam_keluar: '15:16', nopol: 'BD 8260 W', netto: 1780, janjang: 109, lokasi: 'AFD C NASAL' },
  { id: 'Tiket.0006', tanggal: '2026-01-03', jam_masuk: '15:38', jam_keluar: '15:43', nopol: 'BD 9737 AR', netto: 690, janjang: 55, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0007', tanggal: '2026-01-03', jam_masuk: '15:52', jam_keluar: '15:57', nopol: 'BD 9737 AR', netto: 480, janjang: 34, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0008', tanggal: '2026-01-03', jam_masuk: '16:03', jam_keluar: '16:08', nopol: 'BD 9737 AR', netto: 160, janjang: 15, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0009', tanggal: '2026-01-03', jam_masuk: '17:12', jam_keluar: '17:27', nopol: 'BD 9127 EX', netto: 1080, janjang: 83, lokasi: 'AFD B NASAL' },
  { id: 'Tiket.0010', tanggal: '2026-01-05', jam_masuk: '07:29', jam_keluar: '07:49', nopol: 'B 9870 SAM', netto: 970, janjang: 83, lokasi: 'AFD C NASAL' },
  { id: 'Tiket.0011', tanggal: '2026-01-05', jam_masuk: '07:31', jam_keluar: '07:46', nopol: 'BD 9737 AR', netto: 1470, janjang: 86, lokasi: 'AFD B NASAL' },
  { id: 'Tiket.0012', tanggal: '2026-01-05', jam_masuk: '07:33', jam_keluar: '07:41', nopol: 'BD 8259 W', netto: 4960, janjang: 393, lokasi: 'AFD A NASAL' },
  { id: 'Tiket.0013', tanggal: '2026-01-05', jam_masuk: '07:35', jam_keluar: '07:43', nopol: 'BD 8255 W', netto: 2400, janjang: 175, lokasi: 'AFD A NASAL' },
  { id: 'Tiket.0014', tanggal: '2026-01-05', jam_masuk: '11:42', jam_keluar: '11:49', nopol: 'BD 9737 AR', netto: 730, janjang: 65, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0015', tanggal: '2026-01-05', jam_masuk: '14:52', jam_keluar: '14:59', nopol: 'BD 9737 AR', netto: 730, janjang: 78, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0016', tanggal: '2026-01-05', jam_masuk: '15:37', jam_keluar: '15:43', nopol: 'BD 8256 W', netto: 3260, janjang: 273, lokasi: 'AFD C NASAL' },
  { id: 'Tiket.0017', tanggal: '2026-01-05', jam_masuk: '15:59', jam_keluar: '16:05', nopol: 'BD 9737 AR', netto: 630, janjang: 35, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0018', tanggal: '2026-01-05', jam_masuk: '16:12', jam_keluar: '16:21', nopol: 'BD 8255 W', netto: 3520, janjang: 264, lokasi: 'AFD A NASAL' },
  { id: 'Tiket.0019', tanggal: '2026-01-05', jam_masuk: '16:14', jam_keluar: '16:19', nopol: 'BD 9737 AR', netto: 470, janjang: 24, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0020', tanggal: '2026-01-05', jam_masuk: '16:24', jam_keluar: '16:28', nopol: 'BD 9737 AR', netto: 220, janjang: 25, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0021', tanggal: '2026-01-05', jam_masuk: '16:33', jam_keluar: '16:36', nopol: 'BD 9737 AR', netto: 170, janjang: 15, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0022', tanggal: '2026-01-05', jam_masuk: '16:42', jam_keluar: '16:46', nopol: 'BD 9737 AR', netto: 290, janjang: 24, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0023', tanggal: '2026-01-05', jam_masuk: '17:29', jam_keluar: '17:51', nopol: 'BD 9127 EX', netto: 2240, janjang: 201, lokasi: 'AFD B NASAL' },
  { id: 'Tiket.0024', tanggal: '2026-01-05', jam_masuk: '18:08', jam_keluar: '18:13', nopol: 'BD 8258 W', netto: 1490, janjang: 95, lokasi: 'AFD E NASAL' },
  { id: 'Tiket.0025', tanggal: '2026-01-05', jam_masuk: '18:25', jam_keluar: '18:35', nopol: 'BD 9462 NB', netto: 670, janjang: 71, lokasi: 'AFD E NASAL' },
  { id: 'Tiket.0026', tanggal: '2026-01-05', jam_masuk: '18:59', jam_keluar: '19:12', nopol: 'B 9870 SAM', netto: 1000, janjang: 73, lokasi: 'AFD B NASAL' },
  { id: 'Tiket.0027', tanggal: '2026-01-05', jam_masuk: '19:53', jam_keluar: '19:59', nopol: 'BD 8259 W', netto: 5340, janjang: 271, lokasi: 'AFD G BINTUHAN' },
  { id: 'Tiket.0028', tanggal: '2026-01-05', jam_masuk: '20:11', jam_keluar: '20:17', nopol: 'BD 8260 W', netto: 6050, janjang: 339, lokasi: 'AFD A NASAL' },
  { id: 'Tiket.0029', tanggal: '2026-01-06', jam_masuk: '11:17', jam_keluar: '11:26', nopol: 'B 9870 SAM', netto: 1070, janjang: 90, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0030', tanggal: '2026-01-06', jam_masuk: '13:38', jam_keluar: '14:00', nopol: 'BD 9127 EX', netto: 2260, janjang: 211, lokasi: 'AFD B NASAL' },
  { id: 'Tiket.0031', tanggal: '2026-01-06', jam_masuk: '13:41', jam_keluar: '13:49', nopol: 'B 9870 SAM', netto: 720, janjang: 60, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0032', tanggal: '2026-01-06', jam_masuk: '13:52', jam_keluar: '13:57', nopol: 'BD 8260 W', netto: 1080, janjang: 67, lokasi: 'AFD E NASAL' },
  { id: 'Tiket.0033', tanggal: '2026-01-06', jam_masuk: '14:52', jam_keluar: '14:59', nopol: 'BD 8255 W', netto: 3210, janjang: 247, lokasi: 'AFD C NASAL' },
  { id: 'Tiket.0034', tanggal: '2026-01-06', jam_masuk: '15:08', jam_keluar: '15:16', nopol: 'BD 8259 W', netto: 5170, janjang: 419, lokasi: 'AFD B NASAL' },
  { id: 'Tiket.0035', tanggal: '2026-01-06', jam_masuk: '15:39', jam_keluar: '15:50', nopol: 'B 9870 SAM', netto: 1320, janjang: 119, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0036', tanggal: '2026-01-06', jam_masuk: '16:36', jam_keluar: '16:47', nopol: 'B 9870 SAM', netto: 1190, janjang: 95, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0037', tanggal: '2026-01-06', jam_masuk: '17:01', jam_keluar: '17:18', nopol: 'BD 9462 NB', netto: 940, janjang: 63, lokasi: 'AFD E NASAL' },
  { id: 'Tiket.0038', tanggal: '2026-01-06', jam_masuk: '17:06', jam_keluar: '17:14', nopol: 'B 9870 SAM', netto: 500, janjang: 25, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0039', tanggal: '2026-01-06', jam_masuk: '17:07', jam_keluar: '17:16', nopol: 'BD 8258 W', netto: 5360, janjang: 386, lokasi: 'AFD A NASAL' },
  { id: 'Tiket.0040', tanggal: '2026-01-06', jam_masuk: '17:35', jam_keluar: '17:42', nopol: 'B 9870 SAM', netto: 490, janjang: 30, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0041', tanggal: '2026-01-06', jam_masuk: '17:51', jam_keluar: '17:56', nopol: 'B 9870 SAM', netto: 240, janjang: 20, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0042', tanggal: '2026-01-06', jam_masuk: '18:07', jam_keluar: '18:12', nopol: 'B 9870 SAM', netto: 530, janjang: 30, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0043', tanggal: '2026-01-06', jam_masuk: '18:15', jam_keluar: '18:19', nopol: 'BD 8256 W', netto: 1510, janjang: 120, lokasi: 'AFD G BINTUHAN' },
  { id: 'Tiket.0044', tanggal: '2026-01-06', jam_masuk: '18:41', jam_keluar: '18:53', nopol: 'BD 9737 AR', netto: 910, janjang: 76, lokasi: 'AFD F BINTUHAN' },
  { id: 'Tiket.0045', tanggal: '2026-01-06', jam_masuk: '18:43', jam_keluar: '18:52', nopol: 'BD 9462 NB', netto: 760, janjang: 73, lokasi: 'AFD E NASAL' },
  { id: 'Tiket.0046', tanggal: '2026-01-06', jam_masuk: '19:27', jam_keluar: '19:53', nopol: 'BD 9753 EX', netto: 2350, janjang: 202, lokasi: 'AFD B NASAL' },
  { id: 'Tiket.0047', tanggal: '2026-01-06', jam_masuk: '19:29', jam_keluar: '19:34', nopol: 'BD 8259 W', netto: 3400, janjang: 297, lokasi: 'AFD A NASAL' },
  { id: 'Tiket.0048', tanggal: '2026-01-07', jam_masuk: '11:09', jam_keluar: '11:18', nopol: 'BD 9737 AR', netto: 1140, janjang: 90, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0049', tanggal: '2026-01-07', jam_masuk: '13:54', jam_keluar: '14:03', nopol: 'BD 8256 W', netto: 5520, janjang: 362, lokasi: 'AFD A NASAL' },
  { id: 'Tiket.0050', tanggal: '2026-01-07', jam_masuk: '14:23', jam_keluar: '14:35', nopol: 'BD 9737 AR', netto: 1600, janjang: 115, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0051', tanggal: '2026-01-07', jam_masuk: '14:27', jam_keluar: '14:37', nopol: 'BD 8259 W', netto: 1040, janjang: 98, lokasi: 'AFD E NASAL' },
  { id: 'Tiket.0052', tanggal: '2026-01-07', jam_masuk: '14:39', jam_keluar: '14:59', nopol: 'BD 9127 EX', netto: 2120, janjang: 162, lokasi: 'AFD B NASAL' },
  { id: 'Tiket.0053', tanggal: '2026-01-07', jam_masuk: '14:53', jam_keluar: '15:01', nopol: 'BD 9737 AR', netto: 690, janjang: 60, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0054', tanggal: '2026-01-07', jam_masuk: '16:01', jam_keluar: '16:08', nopol: 'BD 8258 W', netto: 4750, janjang: 393, lokasi: 'AFD C NASAL' },
  { id: 'Tiket.0055', tanggal: '2026-01-07', jam_masuk: '16:06', jam_keluar: '16:14', nopol: 'BD 9737 AR', netto: 1210, janjang: 97, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0056', tanggal: '2026-01-07', jam_masuk: '16:52', jam_keluar: '16:57', nopol: 'BD 9737 AR', netto: 610, janjang: 32, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0057', tanggal: '2026-01-07', jam_masuk: '17:31', jam_keluar: '17:35', nopol: 'BD 9737 AR', netto: 510, janjang: 45, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0058', tanggal: '2026-01-07', jam_masuk: '17:51', jam_keluar: '17:56', nopol: 'BD 9737 AR', netto: 360, janjang: 31, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0059', tanggal: '2026-01-07', jam_masuk: '17:55', jam_keluar: '18:00', nopol: 'BD 8259 W', netto: 3190, janjang: 217, lokasi: 'AFD A NASAL' },
  { id: 'Tiket.0060', tanggal: '2026-01-07', jam_masuk: '18:30', jam_keluar: '18:40', nopol: 'BD 9737 AR', netto: 1590, janjang: 100, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0061', tanggal: '2026-01-07', jam_masuk: '18:38', jam_keluar: '18:54', nopol: 'BD 9127 EX', netto: 2210, janjang: 201, lokasi: 'AFD B NASAL' },
  { id: 'Tiket.0062', tanggal: '2026-01-07', jam_masuk: '19:04', jam_keluar: '19:11', nopol: 'BD 9737 AR', netto: 1390, janjang: 103, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0063', tanggal: '2026-01-07', jam_masuk: '19:15', jam_keluar: '19:27', nopol: 'BD 9683 PC', netto: 650, janjang: 57, lokasi: 'AFD E NASAL' },
  { id: 'Tiket.0064', tanggal: '2026-01-07', jam_masuk: '19:34', jam_keluar: '19:51', nopol: 'BD 8260 W', netto: 5970, janjang: 428, lokasi: 'AFD A NASAL' },
  { id: 'Tiket.0065', tanggal: '2026-01-07', jam_masuk: '19:47', jam_keluar: '19:53', nopol: 'BD 8255 W', netto: 7150, janjang: 687, lokasi: 'AFD F BINTUHAN' },
  { id: 'Tiket.0066', tanggal: '2026-01-08', jam_masuk: '07:47', jam_keluar: '08:02', nopol: 'BD 8259 W', netto: 1320, janjang: 78, lokasi: 'AFD G BINTUHAN' },
  { id: 'Tiket.0067', tanggal: '2026-01-08', jam_masuk: '07:49', jam_keluar: '08:16', nopol: 'B 9870 SAM', netto: 1810, janjang: 116, lokasi: 'AFD F BINTUHAN' },
  { id: 'Tiket.0068', tanggal: '2026-01-08', jam_masuk: '10:56', jam_keluar: '11:01', nopol: 'B 9870 SAM', netto: 360, janjang: 20, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0069', tanggal: '2026-01-08', jam_masuk: '11:36', jam_keluar: '11:44', nopol: 'B 9870 SAM', netto: 710, janjang: 40, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0070', tanggal: '2026-01-08', jam_masuk: '15:32', jam_keluar: '15:39', nopol: 'BD 8255 W', netto: 6170, janjang: 424, lokasi: 'AFD A NASAL' },
  { id: 'Tiket.0071', tanggal: '2026-01-08', jam_masuk: '15:44', jam_keluar: '15:51', nopol: 'BD 9737 AR', netto: 900, janjang: 50, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0072', tanggal: '2026-01-08', jam_masuk: '16:29', jam_keluar: '16:46', nopol: 'BD 9127 EX', netto: 1960, janjang: 187, lokasi: 'AFD B NASAL' },
  { id: 'Tiket.0073', tanggal: '2026-01-08', jam_masuk: '16:36', jam_keluar: '16:43', nopol: 'BD 8256 W', netto: 870, janjang: 42, lokasi: 'AFD E NASAL' },
  { id: 'Tiket.0074', tanggal: '2026-01-08', jam_masuk: '16:55', jam_keluar: '17:10', nopol: 'BD 9462 NB', netto: 800, janjang: 85, lokasi: 'AFD E NASAL' },
  { id: 'Tiket.0075', tanggal: '2026-01-08', jam_masuk: '17:00', jam_keluar: '17:05', nopol: 'BD 8260 W', netto: 2620, janjang: 203, lokasi: 'AFD C NASAL' },
  { id: 'Tiket.0076', tanggal: '2026-01-08', jam_masuk: '17:08', jam_keluar: '17:14', nopol: 'BD 8259 W', netto: 5260, janjang: 437, lokasi: 'AFD A NASAL' },
  { id: 'Tiket.0077', tanggal: '2026-01-08', jam_masuk: '17:40', jam_keluar: '17:50', nopol: 'B 9870 SAM', netto: 1530, janjang: 129, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0078', tanggal: '2026-01-08', jam_masuk: '17:54', jam_keluar: '17:59', nopol: 'BD 9737 AR', netto: 600, janjang: 40, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0079', tanggal: '2026-01-08', jam_masuk: '18:23', jam_keluar: '18:28', nopol: 'BD 9737 AR', netto: 450, janjang: 30, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0080', tanggal: '2026-01-08', jam_masuk: '18:24', jam_keluar: '18:34', nopol: 'B 9870 SAM', netto: 1370, janjang: 72, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0081', tanggal: '2026-01-08', jam_masuk: '18:47', jam_keluar: '18:55', nopol: 'BD 8258 W', netto: 3250, janjang: 201, lokasi: 'AFD A NASAL' },
  { id: 'Tiket.0082', tanggal: '2026-01-08', jam_masuk: '18:49', jam_keluar: '18:58', nopol: 'B 9870 SAM', netto: 870, janjang: 68, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0083', tanggal: '2026-01-08', jam_masuk: '18:51', jam_keluar: '18:59', nopol: 'BD 9737 AR', netto: 1060, janjang: 63, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0084', tanggal: '2026-01-08', jam_masuk: '20:19', jam_keluar: '20:31', nopol: 'B 9870 SAM', netto: 790, janjang: 60, lokasi: 'AFD B NASAL' },
  { id: 'Tiket.0085', tanggal: '2026-01-08', jam_masuk: '20:33', jam_keluar: '20:40', nopol: 'BD 8259 W', netto: 1930, janjang: 112, lokasi: 'AFD G BINTUHAN' },
  { id: 'Tiket.0086', tanggal: '2026-01-09', jam_masuk: '14:16', jam_keluar: '14:28', nopol: 'B 9870 SAM', netto: 1070, janjang: 95, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0087', tanggal: '2026-01-09', jam_masuk: '15:57', jam_keluar: '16:15', nopol: 'BD 9127 EX', netto: 1870, janjang: 158, lokasi: 'AFD B NASAL' },
  { id: 'Tiket.0088', tanggal: '2026-01-09', jam_masuk: '16:18', jam_keluar: '16:25', nopol: 'BD 8258 W', netto: 2740, janjang: 230, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0089', tanggal: '2026-01-09', jam_masuk: '16:22', jam_keluar: '16:29', nopol: 'BD 8255 W', netto: 1070, janjang: 97, lokasi: 'AFD E NASAL' },
  { id: 'Tiket.0090', tanggal: '2026-01-09', jam_masuk: '16:27', jam_keluar: '16:36', nopol: 'BD 8256 W', netto: 5880, janjang: 363, lokasi: 'AFD A NASAL' },
  { id: 'Tiket.0091', tanggal: '2026-01-09', jam_masuk: '16:34', jam_keluar: '16:40', nopol: 'B 9870 SAM', netto: 370, janjang: 24, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0092', tanggal: '2026-01-09', jam_masuk: '16:45', jam_keluar: '16:50', nopol: 'B 9870 SAM', netto: 260, janjang: 20, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0093', tanggal: '2026-01-09', jam_masuk: '17:50', jam_keluar: '18:05', nopol: 'BD 9473 WA', netto: 1630, janjang: 126, lokasi: 'AFD F BINTUHAN' },
  { id: 'Tiket.0094', tanggal: '2026-01-09', jam_masuk: '18:01', jam_keluar: '18:08', nopol: 'B 9870 SAM', netto: 580, janjang: 38, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0095', tanggal: '2026-01-09', jam_masuk: '18:12', jam_keluar: '18:19', nopol: 'BD 8259 W', netto: 4270, janjang: 334, lokasi: 'AFD C NASAL' },
  { id: 'Tiket.0096', tanggal: '2026-01-09', jam_masuk: '18:46', jam_keluar: '18:54', nopol: 'B 9870 SAM', netto: 1330, janjang: 95, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0097', tanggal: '2026-01-09', jam_masuk: '19:00', jam_keluar: '19:07', nopol: 'B 9870 SAM', netto: 270, janjang: 16, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0098', tanggal: '2026-01-09', jam_masuk: '19:02', jam_keluar: '19:14', nopol: 'BD 9127 EX', netto: 990, janjang: 67, lokasi: 'AFD B NASAL' },
  { id: 'Tiket.0099', tanggal: '2026-01-09', jam_masuk: '19:05', jam_keluar: '19:12', nopol: 'BD 8260 W', netto: 6200, janjang: 494, lokasi: 'AFD A NASAL' },
  { id: 'Tiket.0100', tanggal: '2026-01-09', jam_masuk: '19:16', jam_keluar: '19:25', nopol: 'BD 9683 PC', netto: 630, janjang: 80, lokasi: 'AFD E NASAL' },
  { id: 'Tiket.0101', tanggal: '2026-01-09', jam_masuk: '19:23', jam_keluar: '19:29', nopol: 'BD 8255 W', netto: 1030, janjang: 81, lokasi: 'AFD G BINTUHAN' },
  { id: 'Tiket.0102', tanggal: '2026-01-10', jam_masuk: '09:59', jam_keluar: '10:08', nopol: 'B 9870 SAM', netto: 530, janjang: 33, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0103', tanggal: '2026-01-10', jam_masuk: '14:28', jam_keluar: '14:36', nopol: 'BD 8259 W', netto: 2960, janjang: 258, lokasi: 'AFD A NASAL' },
  { id: 'Tiket.0104', tanggal: '2026-01-10', jam_masuk: '15:06', jam_keluar: '15:12', nopol: 'BD 8260 W', netto: 640, janjang: 55, lokasi: 'AFD E NASAL' },
  { id: 'Tiket.0105', tanggal: '2026-01-10', jam_masuk: '15:57', jam_keluar: '16:11', nopol: 'B 9870 SAM', netto: 1900, janjang: 125, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0106', tanggal: '2026-01-10', jam_masuk: '16:26', jam_keluar: '16:44', nopol: 'BD 9127 EX', netto: 1890, janjang: 132, lokasi: 'AFD B NASAL' },
  { id: 'Tiket.0107', tanggal: '2026-01-10', jam_masuk: '17:02', jam_keluar: '17:07', nopol: 'B 9870 SAM', netto: 410, janjang: 25, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0108', tanggal: '2026-01-10', jam_masuk: '17:04', jam_keluar: '17:12', nopol: 'BD 9737 AR', netto: 1410, janjang: 80, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0109', tanggal: '2026-01-10', jam_masuk: '17:27', jam_keluar: '17:33', nopol: 'BD 8256 W', netto: 3960, janjang: 336, lokasi: 'AFD C NASAL' },
  { id: 'Tiket.0110', tanggal: '2026-01-10', jam_masuk: '17:32', jam_keluar: '17:38', nopol: 'B 9870 SAM', netto: 750, janjang: 65, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0111', tanggal: '2026-01-10', jam_masuk: '17:41', jam_keluar: '17:46', nopol: 'BD 9737 AR', netto: 290, janjang: 25, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0112', tanggal: '2026-01-10', jam_masuk: '18:04', jam_keluar: '18:12', nopol: 'BD 9462 NB', netto: 670, janjang: 66, lokasi: 'AFD E NASAL' },
  { id: 'Tiket.0113', tanggal: '2026-01-10', jam_masuk: '18:47', jam_keluar: '18:55', nopol: 'BD 8259 W', netto: 1690, janjang: 130, lokasi: 'AFD F BINTUHAN' },
  { id: 'Tiket.0114', tanggal: '2026-01-10', jam_masuk: '18:50', jam_keluar: '18:57', nopol: 'BD 8258 W', netto: 5670, janjang: 397, lokasi: 'AFD A NASAL' },
  { id: 'Tiket.0115', tanggal: '2026-01-10', jam_masuk: '19:27', jam_keluar: '19:40', nopol: 'BD 9127 EX', netto: 1530, janjang: 109, lokasi: 'AFD B NASAL' },
  { id: 'Tiket.0116', tanggal: '2026-01-10', jam_masuk: '19:45', jam_keluar: '20:04', nopol: 'BD 9473 WA', netto: 1650, janjang: 140, lokasi: 'AFD G BINTUHAN' },
  { id: 'Tiket.0117', tanggal: '2026-01-12', jam_masuk: '11:14', jam_keluar: '11:22', nopol: 'B 9870 SAM', netto: 380, janjang: 32, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0118', tanggal: '2026-01-12', jam_masuk: '11:52', jam_keluar: '11:59', nopol: 'B 9870 SAM', netto: 350, janjang: 25, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0119', tanggal: '2026-01-12', jam_masuk: '15:05', jam_keluar: '15:18', nopol: 'BD 9127 EX', netto: 1880, janjang: 148, lokasi: 'AFD B NASAL' },
  { id: 'Tiket.0120', tanggal: '2026-01-12', jam_masuk: '15:39', jam_keluar: '15:45', nopol: 'BD 8259 W', netto: 880, janjang: 55, lokasi: 'AFD E NASAL' },
  { id: 'Tiket.0121', tanggal: '2026-01-12', jam_masuk: '16:26', jam_keluar: '16:32', nopol: 'BD 8256 W', netto: 3740, janjang: 302, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0122', tanggal: '2026-01-12', jam_masuk: '16:56', jam_keluar: '17:03', nopol: 'B 9870 SAM', netto: 770, janjang: 45, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0123', tanggal: '2026-01-12', jam_masuk: '17:10', jam_keluar: '17:15', nopol: 'B 9870 SAM', netto: 430, janjang: 25, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0124', tanggal: '2026-01-12', jam_masuk: '17:41', jam_keluar: '17:54', nopol: 'BD 9127 EX', netto: 1390, janjang: 130, lokasi: 'AFD B NASAL' },
  { id: 'Tiket.0125', tanggal: '2026-01-12', jam_masuk: '18:19', jam_keluar: '18:26', nopol: 'BD 9462 NB', netto: 690, janjang: 91, lokasi: 'AFD E NASAL' },
  { id: 'Tiket.0126', tanggal: '2026-01-12', jam_masuk: '18:54', jam_keluar: '19:01', nopol: 'BD 8255 W', netto: 5340, janjang: 362, lokasi: 'AFD A NASAL' },
  { id: 'Tiket.0127', tanggal: '2026-01-12', jam_masuk: '19:08', jam_keluar: '19:16', nopol: 'BD 8258 W', netto: 5330, janjang: 489, lokasi: 'AFD C NASAL' },
  { id: 'Tiket.0128', tanggal: '2026-01-12', jam_masuk: '19:53', jam_keluar: '20:00', nopol: 'BD 8260 W', netto: 4390, janjang: 293, lokasi: 'AFD A NASAL' },
  { id: 'Tiket.0129', tanggal: '2026-01-12', jam_masuk: '20:15', jam_keluar: '20:40', nopol: 'BD 9473 WA', netto: 1580, janjang: 180, lokasi: 'AFD F BINTUHAN' },
  { id: 'Tiket.0130', tanggal: '2026-01-12', jam_masuk: '20:28', jam_keluar: '20:42', nopol: 'B 9870 SAM', netto: 830, janjang: 70, lokasi: 'AFD G BINTUHAN' },
  { id: 'Tiket.0131', tanggal: '2026-01-13', jam_masuk: '11:26', jam_keluar: '11:32', nopol: 'B 9129 SAN', netto: 290, janjang: 21, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0132', tanggal: '2026-01-13', jam_masuk: '15:37', jam_keluar: '15:42', nopol: 'BD 8255 W', netto: 940, janjang: 58, lokasi: 'AFD E NASAL' },
  { id: 'Tiket.0133', tanggal: '2026-01-13', jam_masuk: '15:39', jam_keluar: '15:51', nopol: 'B 9129 SAN', netto: 1770, janjang: 155, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0134', tanggal: '2026-01-13', jam_masuk: '16:29', jam_keluar: '16:35', nopol: 'B 9129 SAN', netto: 490, janjang: 28, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0135', tanggal: '2026-01-13', jam_masuk: '16:42', jam_keluar: '16:47', nopol: 'B 9129 SAN', netto: 230, janjang: 17, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0136', tanggal: '2026-01-13', jam_masuk: '17:58', jam_keluar: '18:15', nopol: 'BD 9127 EX', netto: 2510, janjang: 280, lokasi: 'AFD B NASAL' },
  { id: 'Tiket.0137', tanggal: '2026-01-13', jam_masuk: '18:11', jam_keluar: '18:19', nopol: 'BD 8260 W', netto: 1480, janjang: 115, lokasi: 'AFD C NASAL' },
  { id: 'Tiket.0138', tanggal: '2026-01-13', jam_masuk: '18:27', jam_keluar: '18:42', nopol: 'BD 9683 PC', netto: 1040, janjang: 92, lokasi: 'AFD E NASAL' },
  { id: 'Tiket.0139', tanggal: '2026-01-13', jam_masuk: '18:40', jam_keluar: '18:46', nopol: 'BD 8258 W', netto: 1730, janjang: 161, lokasi: 'AFD F BINTUHAN' },
  { id: 'Tiket.0140', tanggal: '2026-01-13', jam_masuk: '20:49', jam_keluar: '21:02', nopol: 'B 9870 SAM', netto: 1320, janjang: 126, lokasi: 'AFD C NASAL' },
  { id: 'Tiket.0141', tanggal: '2026-01-13', jam_masuk: '21:13', jam_keluar: '21:25', nopol: 'B 9129 SAN', netto: 980, janjang: 90, lokasi: 'AFD A NASAL' },
  { id: 'Tiket.0142', tanggal: '2026-01-13', jam_masuk: '21:15', jam_keluar: '21:22', nopol: 'BD 8259 W', netto: 7110, janjang: 470, lokasi: 'AFD A NASAL' },
  { id: 'Tiket.0143', tanggal: '2026-01-14', jam_masuk: '13:54', jam_keluar: '14:01', nopol: 'B 9870 SAM', netto: 450, janjang: 30, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0144', tanggal: '2026-01-14', jam_masuk: '13:59', jam_keluar: '14:07', nopol: 'BD 8259 W', netto: 880, janjang: 61, lokasi: 'AFD E NASAL' },
  { id: 'Tiket.0145', tanggal: '2026-01-14', jam_masuk: '14:27', jam_keluar: '14:34', nopol: 'B 9870 SAM', netto: 880, janjang: 45, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0146', tanggal: '2026-01-14', jam_masuk: '17:27', jam_keluar: '17:34', nopol: 'BD 8256 W', netto: 5960, janjang: 405, lokasi: 'AFD A NASAL' },
  { id: 'Tiket.0147', tanggal: '2026-01-14', jam_masuk: '18:12', jam_keluar: '18:20', nopol: 'BD 9683 PC', netto: 540, janjang: 45, lokasi: 'AFD E NASAL' },
  { id: 'Tiket.0148', tanggal: '2026-01-14', jam_masuk: '19:34', jam_keluar: '19:45', nopol: 'BD 9127 EX', netto: 1060, janjang: 106, lokasi: 'AFD B NASAL' },
  { id: 'Tiket.0149', tanggal: '2026-01-15', jam_masuk: '11:04', jam_keluar: '11:13', nopol: 'B 9870 SAM', netto: 650, janjang: 46, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0150', tanggal: '2026-01-15', jam_masuk: '11:45', jam_keluar: '11:50', nopol: 'B 9870 SAM', netto: 370, janjang: 18, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0151', tanggal: '2026-01-15', jam_masuk: '13:57', jam_keluar: '14:03', nopol: 'B 9870 SAM', netto: 490, janjang: 24, lokasi: 'AFD D NASAL' },
  { id: 'Tiket.0152', tanggal: '2026-01-15', jam_masuk: '14:24', jam_keluar: '14:31', nopol: 'BD 8259 W', netto: 850, janjang: 71, lokasi: 'AFD E NASAL' }
];

// Mock data for fallback (Hanya tampil jika database tidak connect)
// Kita gunakan data yang lebih lengkap sekarang
const INITIAL_DATA: Ticket[] = MOCK_CSV_DATA;

// Helper to format error message safely
const formatError = (context: string, error: any) => {
  console.error(context, error);
  const msg = error?.message || error?.error_description || JSON.stringify(error);
  return new Error(`${context}: ${msg}`);
};

export const fetchTickets = async (): Promise<Ticket[]> => {
  if (!isSupabaseConfigured()) {
    console.warn("Mode Offline: Menggunakan data mock.");
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return INITIAL_DATA;
  }

  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .order('tanggal', { ascending: false })
    .order('jam_masuk', { ascending: false });

  if (error) {
    throw formatError("Error fetching tickets", error);
  }
  return data || [];
};

export const fetchAnnouncements = async (): Promise<Announcement[]> => {
  if (!isSupabaseConfigured()) {
    return [
      { id: 1, content: "Selamat Datang - Mode Demo (Database Belum Terhubung)" },
    ];
  }

  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw formatError("Error fetching announcements", error);
  }
  return data || [];
};

export const addAnnouncement = async (content: string): Promise<Announcement | null> => {
  if (!isSupabaseConfigured()) throw new Error("Database belum terhubung. Tidak bisa menambah data.");

  const { data, error } = await supabase
    .from('announcements')
    .insert([{ content }])
    .select()
    .single();

  if (error) {
    throw formatError("Error adding announcement", error);
  }
  return data;
};

export const deleteAnnouncement = async (id: number): Promise<void> => {
  if (!isSupabaseConfigured()) throw new Error("Database belum terhubung.");

  const { error } = await supabase
    .from('announcements')
    .delete()
    .eq('id', id);

  if (error) {
    throw formatError("Error deleting announcement", error);
  }
};

export const uploadTicketsBulk = async (tickets: Ticket[]): Promise<number> => {
  // PENTING: Jangan pura-pura sukses jika tidak ada koneksi DB
  if (!isSupabaseConfigured()) {
    throw new Error("KONEKSI GAGAL: Supabase URL/Key belum disetting di .env. Data tidak disimpan.");
  }

  if (tickets.length === 0) return 0;

  const { data, error } = await supabase
    .from('tickets')
    .upsert(tickets, { onConflict: 'id' })
    .select();

  if (error) {
    throw formatError("Error uploading tickets", error);
  }

  return data ? data.length : 0;
};

// --- SIMULATE WEATHER DATA ---
// Generate data cuaca mock berdasarkan tanggal-tanggal yang ada di chart
export const fetchWeatherLogs = async (dates: string[]): Promise<WeatherLog[]> => {
  // Simulasi: Deterministic random berdasarkan tanggal string agar konsisten saat refresh
  return dates.map(date => {
    const hash = date.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const rainChance = hash % 100;

    let rainfall = 0;
    let condition: WeatherLog['condition'] = 'Cerah';

    if (rainChance > 70) {
      rainfall = (hash % 40) + 10; // 10 - 50mm
      condition = rainfall > 30 ? 'Hujan Deras' : 'Hujan Ringan';
    } else if (rainChance > 50) {
      condition = 'Berawan';
    }

    return {
      date,
      rainfall,
      condition
    };
  });
};

// =============================================================================
// LOCATION MANAGEMENT FUNCTIONS
// =============================================================================

// Mock location data for demo mode
const MOCK_LOCATIONS: Location[] = [
  {
    id: '1', code: 'AFD-A', name: 'AFD A', full_name: 'AFD A NASAL', category: 'internal',
    latitude: -6.123456, longitude: 106.789012, is_active: true,
    pic_mandor_name: 'Budi Santoso', pic_contact: '081234567890',
    area_hectares: 125.5, distance_to_factory_km: 5.2
  },
  {
    id: '2', code: 'AFD-B', name: 'AFD B', full_name: 'AFD B NASAL', category: 'internal',
    latitude: -6.134567, longitude: 106.790123, is_active: true,
    pic_mandor_name: 'Siti Aminah', pic_contact: '081234567891',
    area_hectares: 98.3, distance_to_factory_km: 7.8
  },
  {
    id: '3', code: 'AFD-C', name: 'AFD C', full_name: 'AFD C NASAL', category: 'internal',
    is_active: true, pic_mandor_name: 'Ahmad Yani',
    area_hectares: 110.0, distance_to_factory_km: 6.5
  },
  {
    id: '4', code: 'AFD-D', name: 'AFD D', full_name: 'AFD D NASAL', category: 'internal',
    is_active: true, area_hectares: 85.2, distance_to_factory_km: 9.1
  },
  {
    id: '5', code: 'AFD-E', name: 'AFD E', full_name: 'AFD E NASAL', category: 'internal',
    is_active: true, area_hectares: 72.8, distance_to_factory_km: 8.3
  },
  {
    id: '6', code: 'AFD-F', name: 'AFD F', full_name: 'AFD F BINTUHAN', category: 'internal',
    is_active: true, area_hectares: 105.0, distance_to_factory_km: 12.5
  },
  {
    id: '7', code: 'AFD-G', name: 'AFD G', full_name: 'AFD G BINTUHAN', category: 'internal',
    is_active: true, area_hectares: 95.0, distance_to_factory_km: 11.2
  },
  {
    id: '8', code: 'PLM-01', name: 'Plasma 01', full_name: 'PLASMA KEBUN RAKYAT 01', category: 'plasma',
    is_active: true, area_hectares: 45.0, distance_to_factory_km: 15.3
  },
  {
    id: '9', code: 'EXT-01', name: 'External 01', full_name: 'THIRD PARTY SUPPLIER 01', category: 'external',
    is_active: true, area_hectares: 60.0, distance_to_factory_km: 25.0
  },
];

export const fetchLocations = async (activeOnly: boolean = false): Promise<Location[]> => {
  if (!isSupabaseConfigured()) {
    console.warn("Mode Offline: Menggunakan data lokasi mock.");
    await new Promise(resolve => setTimeout(resolve, 500));
    return activeOnly ? MOCK_LOCATIONS.filter(loc => loc.is_active) : MOCK_LOCATIONS;
  }

  let query = supabase
    .from('locations')
    .select('*')
    .order('code', { ascending: true });

  if (activeOnly) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;

  if (error) {
    throw formatError("Error fetching locations", error);
  }
  return data || [];
};

export const addLocation = async (locationData: LocationFormData): Promise<Location | null> => {
  if (!isSupabaseConfigured()) throw new Error("Database belum terhubung. Tidak bisa menambah data.");

  const { data, error } = await supabase
    .from('locations')
    .insert([{
      ...locationData,
      latitude: locationData.latitude ? parseFloat(locationData.latitude) : null,
      longitude: locationData.longitude ? parseFloat(locationData.longitude) : null,
      area_hectares: locationData.area_hectares ? parseFloat(locationData.area_hectares) : null,
      distance_to_factory_km: locationData.distance_to_factory_km ? parseFloat(locationData.distance_to_factory_km) : null,
    }])
    .select()
    .single();

  if (error) {
    throw formatError("Error adding location", error);
  }
  return data;
};

export const updateLocation = async (id: string, locationData: Partial<LocationFormData>): Promise<Location | null> => {
  if (!isSupabaseConfigured()) throw new Error("Database belum terhubung.");

  const updatePayload: any = { ...locationData };

  // Convert string numbers to actual numbers
  if (locationData.latitude !== undefined) updatePayload.latitude = locationData.latitude ? parseFloat(locationData.latitude) : null;
  if (locationData.longitude !== undefined) updatePayload.longitude = locationData.longitude ? parseFloat(locationData.longitude) : null;
  if (locationData.area_hectares !== undefined) updatePayload.area_hectares = locationData.area_hectares ? parseFloat(locationData.area_hectares) : null;
  if (locationData.distance_to_factory_km !== undefined) updatePayload.distance_to_factory_km = locationData.distance_to_factory_km ? parseFloat(locationData.distance_to_factory_km) : null;

  const { data, error } = await supabase
    .from('locations')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw formatError("Error updating location", error);
  }
  return data;
};

export const deleteLocation = async (id: string): Promise<void> => {
  if (!isSupabaseConfigured()) throw new Error("Database belum terhubung.");

  const { error } = await supabase
    .from('locations')
    .delete()
    .eq('id', id);

  if (error) {
    throw formatError("Error deleting location", error);
  }
};

export const toggleLocationStatus = async (id: string, isActive: boolean): Promise<Location | null> => {
  if (!isSupabaseConfigured()) throw new Error("Database belum terhubung.");

  const { data, error } = await supabase
    .from('locations')
    .update({ is_active: isActive })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw formatError("Error toggling location status", error);
  }
  return data;
};

export const fetchLocationHistory = async (locationId: string): Promise<LocationHistory[]> => {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('location_history')
    .select('*')
    .eq('location_id', locationId)
    .order('changed_at', { ascending: false });

  if (error) {
    throw formatError("Error fetching location history", error);
  }
  return data || [];
};

// =============================================================================
// BMKG WEATHER FORECAST FUNCTIONS
// =============================================================================

// Generate mock hourly forecasts for demo mode
const generateMockHourlyForecasts = (): HourlyForecast[] => {
  const now = new Date();
  const forecasts: HourlyForecast[] = [];

  const conditions = [
    { desc: 'Berawan', desc_en: 'Mostly Cloudy', code: 3 },
    { desc: 'Hujan Ringan', desc_en: 'Light Rain', code: 61 },
    { desc: 'Cerah', desc_en: 'Sunny', code: 0 },
  ];

  for (let i = 1; i <= 10; i++) {
    const forecastTime = new Date(now);
    forecastTime.setHours(now.getHours() + i, 0, 0, 0);

    const condition = conditions[i % conditions.length];
    const hash = forecastTime.getHours() + forecastTime.getDate();

    forecasts.push({
      id: `mock-${i}`,
      local_datetime: forecastTime.toISOString(),
      utc_datetime: forecastTime.toISOString(),
      temperature: 23 + (hash % 6),
      humidity: 75 + (hash % 20),
      weather_code: condition.code,
      weather_desc: condition.desc,
      weather_desc_en: condition.desc_en,
      wind_speed: 5 + (hash % 10),
      wind_direction: 'SW',
      cloud_cover: 60 + (hash % 40),
      visibility_text: '> 10 km',
      analysis_date: now.toISOString(),
      updated_at: now.toISOString(),
    });
  }

  return forecasts;
};

// Fetch next 10 hours of weather forecasts from Supabase cache
export const fetchHourlyForecasts = async (): Promise<HourlyForecast[]> => {
  if (!isSupabaseConfigured()) {
    console.warn("Mode Offline: Menggunakan data cuaca mock.");
    await new Promise(resolve => setTimeout(resolve, 300));
    return generateMockHourlyForecasts();
  }

  const now = new Date();

  const { data, error } = await supabase
    .from('weather_forecasts')
    .select('*')
    .gte('local_datetime', now.toISOString())
    .order('local_datetime', { ascending: true })
    .limit(10);

  if (error) {
    console.error("Error fetching weather forecasts:", error);
    // Fallback to mock data on error
    return generateMockHourlyForecasts();
  }

  // If no data in cache, return mock
  if (!data || data.length === 0) {
    console.warn("No weather data in cache, using mock data");
    return generateMockHourlyForecasts();
  }

  return data;
};

// Trigger BMKG weather sync via Edge Function
export const triggerWeatherSync = async (): Promise<{ success: boolean; message?: string }> => {
  if (!isSupabaseConfigured()) {
    return { success: false, message: 'Database not configured' };
  }

  try {
    const { data, error } = await supabase.functions.invoke('sync-bmkg-weather');

    if (error) {
      console.error("Weather sync error:", error);
      return { success: false, message: error.message };
    }

    console.log("Weather sync result:", data);
    return { success: true, message: data?.message || 'Synced successfully' };
  } catch (err: any) {
    console.error("Weather sync failed:", err);
    return { success: false, message: err.message };
  }
};
