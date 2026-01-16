import React, { useState } from 'react';
import { CloudRain, Cloud, Sun, CloudSun, Droplets, Lightbulb, X, AlertTriangle } from 'lucide-react';
import type { WeatherAlert, WeatherSeverity, WeatherLog } from '../types';
import './WeatherAlertBanner.css';

interface WeatherAlertBannerProps {
    alert: WeatherAlert | null;
}

// Get weather icon based on condition
const getWeatherIcon = (condition: string, size: number = 28) => {
    if (condition.includes('Hujan Deras')) return <CloudRain size={size} />;
    if (condition.includes('Hujan')) return <CloudSun size={size} />;
    if (condition === 'Berawan') return <Cloud size={size} />;
    return <Sun size={size} />;
};

// Get severity label
const getSeverityLabel = (severity: WeatherSeverity): string => {
    switch (severity) {
        case 'heavy_rain': return '🔴 PERINGATAN CUACA';
        case 'light_rain': return '🟡 WASPADA CUACA';
        case 'cloudy': return '☁️ INFO CUACA';
        default: return '🟢 CUACA CERAH';
    }
};

export const WeatherAlertBanner: React.FC<WeatherAlertBannerProps> = ({ alert }) => {
    const [isDismissed, setIsDismissed] = useState(false);

    if (!alert || isDismissed) return null;

    // Only show banner for light_rain or heavy_rain
    if (alert.severity === 'clear' || alert.severity === 'cloudy') return null;

    return (
        <div className={`weather-alert-banner severity-${alert.severity}`}>
            <div className="weather-alert-header">
                <div className="weather-alert-icon">
                    {getWeatherIcon(alert.condition)}
                </div>

                <div className="weather-alert-content">
                    <p className="weather-alert-title">{getSeverityLabel(alert.severity)}</p>
                    <p className="weather-alert-condition">
                        Prakiraan {alert.condition.toUpperCase()} hari ini
                    </p>
                    <span className="weather-alert-rainfall">
                        <Droplets size={12} />
                        Curah hujan ~{alert.rainfall}mm
                    </span>
                </div>

                <button
                    onClick={() => setIsDismissed(true)}
                    className="weather-alert-dismiss"
                    title="Tutup peringatan"
                >
                    <X size={18} />
                </button>
            </div>

            {alert.recommendations.length > 0 && (
                <div className="weather-alert-recommendations">
                    <p className="weather-alert-recommendations-title">
                        <Lightbulb size={14} /> Rekomendasi Operasional:
                    </p>
                    <div className="weather-alert-recommendations-list">
                        {alert.recommendations.map((rec, idx) => (
                            <span key={idx} className="recommendation-tag">
                                <AlertTriangle size={12} />
                                {rec}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Forecast Widget Component
interface ForecastWidgetProps {
    weatherLogs: WeatherLog[];
    theme: any;
}

export const ForecastWidget: React.FC<ForecastWidgetProps> = ({ weatherLogs, theme }) => {
    // Get next 3 days forecast
    const today = new Date();
    const forecastDays: WeatherLog[] = [];

    for (let i = 1; i <= 3; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];

        const weather = weatherLogs.find(w => w.date === dateStr);
        if (weather) {
            forecastDays.push(weather);
        } else {
            // Mock data if not found
            forecastDays.push({
                date: dateStr,
                rainfall: Math.floor(Math.random() * 30),
                condition: 'Cerah'
            });
        }
    }

    const getSeverity = (rainfall: number, condition: string): WeatherSeverity => {
        if (rainfall >= 50 || condition === 'Hujan Deras') return 'heavy_rain';
        if (rainfall >= 20 || condition === 'Hujan Ringan') return 'light_rain';
        if (condition === 'Berawan') return 'cloudy';
        return 'clear';
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
    };

    return (
        <div className={`p-4 rounded-xl border ${theme.card} ${theme.border}`}>
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2 ${theme.subtext}`}>
                <CloudRain size={14} /> Prakiraan 3 Hari
            </h4>
            <div className="forecast-widget">
                {forecastDays.map((day, idx) => {
                    const severity = getSeverity(day.rainfall, day.condition);
                    return (
                        <div key={idx} className={`forecast-day severity-${severity}`}>
                            <p className="forecast-date">{formatDate(day.date)}</p>
                            <div className="forecast-icon">
                                {getWeatherIcon(day.condition, 24)}
                            </div>
                            <p className="forecast-condition">{day.condition}</p>
                            <p className="forecast-rainfall">{day.rainfall}mm</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Utility functions for weather alert calculation
export const getWeatherSeverity = (rainfall: number, condition: string): WeatherSeverity => {
    if (rainfall >= 50 || condition === 'Hujan Deras') return 'heavy_rain';
    if (rainfall >= 20 || condition === 'Hujan Ringan') return 'light_rain';
    if (condition === 'Berawan') return 'cloudy';
    return 'clear';
};

export const getWeatherRecommendations = (severity: WeatherSeverity): string[] => {
    switch (severity) {
        case 'heavy_rain':
            return [
                'Percepat proses bongkar TBS',
                'Siapkan terpal loading ramp',
                'Antisipasi keterlambatan truk',
                'Koordinasi dengan mandor'
            ];
        case 'light_rain':
            return [
                'Monitor kondisi jalan kebun',
                'Siapkan area teduh antrian'
            ];
        default:
            return [];
    }
};

export const createWeatherAlert = (weatherLog: WeatherLog | undefined): WeatherAlert | null => {
    if (!weatherLog) return null;

    const severity = getWeatherSeverity(weatherLog.rainfall, weatherLog.condition);
    const recommendations = getWeatherRecommendations(severity);

    return {
        severity,
        rainfall: weatherLog.rainfall,
        condition: weatherLog.condition,
        date: weatherLog.date,
        recommendations
    };
};

export default WeatherAlertBanner;
