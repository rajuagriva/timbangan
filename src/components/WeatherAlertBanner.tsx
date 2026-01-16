import React, { useState } from 'react';
import { CloudRain, Cloud, Sun, CloudSun, Droplets, Lightbulb, X, AlertTriangle, Thermometer, Wind } from 'lucide-react';
import type { WeatherAlert, WeatherSeverity, HourlyForecast } from '../types';
import './WeatherAlertBanner.css';

interface WeatherAlertBannerProps {
    alert: WeatherAlert | null;
}

// Get weather icon based on condition
const getWeatherIcon = (condition: string, size: number = 28) => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('hujan deras')) return <CloudRain size={size} />;
    if (lowerCondition.includes('hujan')) return <CloudSun size={size} />;
    if (lowerCondition.includes('berawan')) return <Cloud size={size} />;
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

// Forecast Widget Component - Updated for 10-Hour Forecast
interface ForecastWidgetProps {
    hourlyForecasts: HourlyForecast[];
    theme: any;
}

// Get severity from weather description
const getSeverityFromWeather = (weatherDesc: string): WeatherSeverity => {
    const desc = weatherDesc.toLowerCase();
    if (desc.includes('hujan deras') || desc.includes('lebat')) return 'heavy_rain';
    if (desc.includes('hujan')) return 'light_rain';
    if (desc.includes('berawan')) return 'cloudy';
    return 'clear';
};

export const ForecastWidget: React.FC<ForecastWidgetProps> = ({ hourlyForecasts, theme }) => {
    const formatHour = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    // Take first 10 hours (or less if not available)
    const displayForecasts = hourlyForecasts.slice(0, 10);

    return (
        <div className={`p-4 rounded-xl border ${theme.card} ${theme.border}`}>
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2 ${theme.subtext}`}>
                <CloudRain size={14} /> Prakiraan 10 Jam
            </h4>
            <div className="forecast-widget forecast-widget-hourly">
                {displayForecasts.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Memuat data cuaca...</p>
                ) : (
                    displayForecasts.map((forecast, idx) => {
                        const severity = getSeverityFromWeather(forecast.weather_desc);
                        return (
                            <div key={idx} className={`forecast-hour severity-${severity}`}>
                                <p className="forecast-time">{formatHour(forecast.local_datetime)}</p>
                                <div className="forecast-icon">
                                    {getWeatherIcon(forecast.weather_desc, 20)}
                                </div>
                                <div className="forecast-details">
                                    <span className="forecast-temp">
                                        <Thermometer size={10} />
                                        {forecast.temperature}°C
                                    </span>
                                    <span className="forecast-wind">
                                        <Wind size={10} />
                                        {forecast.wind_speed}km/h
                                    </span>
                                </div>
                                <p className="forecast-condition-mini" title={forecast.weather_desc}>
                                    {forecast.weather_desc.length > 10
                                        ? forecast.weather_desc.substring(0, 10) + '...'
                                        : forecast.weather_desc}
                                </p>
                            </div>
                        );
                    })
                )}
            </div>
            <p className={`text-[10px] mt-2 ${theme.subtext} text-center opacity-70`}>
                Sumber: BMKG • Update setiap jam
            </p>
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

// Create weather alert from hourly forecast (for the next hour)
export const createWeatherAlertFromHourly = (forecasts: HourlyForecast[]): WeatherAlert | null => {
    if (!forecasts || forecasts.length === 0) return null;

    // Use the first forecast (next hour)
    const nextHour = forecasts[0];
    const severity = getSeverityFromWeather(nextHour.weather_desc);
    const recommendations = getWeatherRecommendations(severity);

    // Estimate rainfall from weather code (BMKG codes: 0=clear, 3=cloudy, 61=light rain, 63=moderate rain, 95=storm)
    let estimatedRainfall = 0;
    if (nextHour.weather_code >= 95) estimatedRainfall = 50;
    else if (nextHour.weather_code >= 63) estimatedRainfall = 30;
    else if (nextHour.weather_code >= 61) estimatedRainfall = 15;

    return {
        severity,
        rainfall: estimatedRainfall,
        condition: nextHour.weather_desc,
        date: nextHour.local_datetime,
        recommendations
    };
};

export default WeatherAlertBanner;
