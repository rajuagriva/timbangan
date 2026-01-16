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
  // Feature #34: Comparison fields
  prevTotalNetto?: number;
  prevTripCount?: number;
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

// Feature #38 Enhanced: Hourly forecast from BMKG API
export interface HourlyForecast {
  id: string;
  local_datetime: string;       // ISO format: "2026-01-16T20:00:00+07:00"
  utc_datetime: string;
  temperature: number;          // °C
  humidity: number;             // %
  weather_code: number;         // BMKG weather code
  weather_desc: string;         // "Berawan", "Hujan Ringan", dll
  weather_desc_en: string;      // English description
  wind_speed: number;           // km/jam
  wind_direction: string;       // "SW", "NE", etc.
  cloud_cover: number;          // %
  visibility_text: string;      // "> 10 km", "< 5 km", etc.
  analysis_date: string;        // When BMKG produced this forecast
  updated_at: string;           // When we last synced this
}

// Period Comparison Types
export interface PeriodRange {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  label: string;     // e.g., "Periode A" or "Minggu Lalu"
}

export interface PeriodStats {
  totalNetto: number;
  totalJanjang: number;
  totalTruk: number;
  avgBJR: number;
  avgDuration: number;
}

export interface ComparisonKPI {
  name: string;
  periodA: number;
  periodB: number;
  delta: number;
  percentage: number; // Positive = increase, negative = decrease
  unit: string;
  isPositiveGood: boolean; // True if increase is good (e.g., Netto), false if decrease is good (e.g., Duration)
}

export interface ComparisonChartData {
  date: string;
  displayDate: string;
  periodA: number | null;
  periodB: number | null;
}

export interface LocationComparisonData {
  name: string;
  fullName: string;
  periodA: number;
  periodB: number;
  delta: number;
}

// Afdeling/Location benchmarking types
export interface AfdelingBenchmark {
  name: string;
  fullName: string;
  totalNetto: number;      // Volume metric
  totalJanjang: number;
  avgBJR: number;          // Quality metric
  tripCount: number;       // Activity metric
  avgDuration: number;     // Efficiency metric  
  consistency: number;     // Supply consistency (0-100%)
  gradeAPercent: number;   // Quality excellence %
  score: number;           // Composite score for ranking
}

export interface BenchmarkMetric {
  key: keyof AfdelingBenchmark;
  label: string;
  unit: string;
  higherIsBetter: boolean;
}

export interface BenchmarkTrendData {
  month: string;
  displayMonth: string;
  data: Record<string, number>;
}

export interface GapAnalysis {
  metric: string;
  value: number;
  average: number;
  best: number;
  gapToAverage: number;
  gapToBest: number;
  percentToAverage: number;
  percentToBest: number;
}

// Master Lokasi / Location Management Types
export interface Location {
  id: string;
  code: string;
  name: string;
  full_name?: string;
  category: 'internal' | 'plasma' | 'external';

  // GPS and Geography
  latitude?: number;
  longitude?: number;
  area_hectares?: number;
  distance_to_factory_km?: number;

  // Management
  pic_mandor_name?: string;
  pic_contact?: string;

  // Status
  is_active: boolean;
  notes?: string;

  // Metadata
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface LocationHistory {
  id: string;
  location_id: string;
  changed_field: string;
  old_value?: string;
  new_value?: string;
  changed_by?: string;
  changed_at: string;
}

export interface LocationFormData {
  code: string;
  name: string;
  full_name?: string;
  category: 'internal' | 'plasma' | 'external';
  latitude?: string;
  longitude?: string;
  area_hectares?: string;
  distance_to_factory_km?: string;
  pic_mandor_name?: string;
  pic_contact?: string;
  is_active: boolean;
  notes?: string;
}

// Live Monitor Types
export type FleetStatus = 'to_mill' | 'to_estate' | 'loading' | 'weighing' | 'workshop' | 'idle';

export interface FleetVehicle {
  id: string;
  nopol: string;
  status: FleetStatus;
  location: string; // "KM 10", "PKS", "AFD A", etc.
  lastUpdate: Date;
  speed?: number; // km/h
}

export type EventType = 'holiday' | 'maintenance' | 'price_change' | 'weather' | 'other';

export interface EventAnnotation {
  date: string; // YYYY-MM-DD
  type: EventType;
  title: string;
  description: string;
}

export interface HarvestEntry {
  id: string;
  block: string;    // e.g., "A01", "B05" or just Location Name if no block map
  location: string; // e.g., "AFD A"
  janjang: number;
  est_bjr: number;
  est_netto: number; // janjang * est_bjr
  status: 'pending' | 'submitted' | 'arrived';
  submitted_at: string;
  mandor_name: string;
}

// Feature #37: ETA Tracker Types
export type ETAStatus = 'on_time' | 'delayed' | 'overdue';

export interface IncomingTruck {
  id: string;
  nopol: string;
  location: string;           // Source location name
  distance_km: number;        // Distance from Location.distance_to_factory_km
  departed_at: string;        // ISO timestamp when truck left source
  eta_minutes: number;        // Calculated ETA in minutes from departure
  status: ETAStatus;          // Dynamic status based on current time vs ETA
}

// Feature #38: Weather Alert Types
export type WeatherSeverity = 'clear' | 'cloudy' | 'light_rain' | 'heavy_rain';

export interface WeatherAlert {
  severity: WeatherSeverity;
  rainfall: number;
  condition: string;
  date: string;
  recommendations: string[];
}
