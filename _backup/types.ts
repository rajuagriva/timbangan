
export interface Ticket {
  id: string; // "Tiket.0001"
  tanggal: string; // "YYYY-MM-DD"
  jam_masuk: string; // "HH:MM"
  jam_keluar: string; // "HH:MM"
  nopol: string;
  netto: number;
  janjang: number;
  lokasi: string;
}

export interface Announcement {
  id: number;
  content: string;
  created_at?: string;
}

export interface ChartDataPoints {
  trend: { date: string; displayDate: string; total: number }[];
  locations: { name: string; fullName: string; value: number }[];
  peakHours: { hour: string; count: number }[];
}

export interface DashboardStats {
  totalNetto: number;
  totalJanjang: number;
  totalTruk: number;
  avgBJR: number | string;
  targetPercent: number;
  avgDuration: number;
  currentTarget: number;
}

export interface VehicleStat {
  nopol: string;
  tripCount: number;
  totalNetto: number;
  avgDuration: number;
  lastVisit: string;
  tickets: Ticket[];
  currentStreak: number;
  level: 'Rookie' | 'Pro' | 'Legend';
}

export type YardStatus = 'queue_weigh_in' | 'waiting_unload' | 'ramp_1' | 'ramp_2' | 'finished';

export interface YardTruck {
  id: string;
  nopol: string;
  driver?: string;
  status: YardStatus;
  arrived_at: string; // ISO timestamp
  updated_at: string;
  source: string; // Lokasi asal
}

export interface WeatherLog {
  date: string;
  rainfall: number; // mm
  condition: 'Cerah' | 'Berawan' | 'Hujan Ringan' | 'Hujan Deras';
}
