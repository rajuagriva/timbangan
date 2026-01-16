import React, { useMemo } from 'react';
import { Truck, MapPin, ArrowRight, Clock } from 'lucide-react';
import type { IncomingTruck, ETAStatus } from '../types';
import './IncomingTrucksPanel.css';

interface IncomingTrucksPanelProps {
    trucks: IncomingTruck[];
    isDarkMode: boolean;
    theme: any;
}

// Calculate remaining minutes based on departure time and ETA
const calculateRemainingMinutes = (departedAt: string, etaMinutes: number): number => {
    const departureTime = new Date(departedAt).getTime();
    const now = Date.now();
    const elapsedMinutes = (now - departureTime) / (1000 * 60);
    return Math.round(etaMinutes - elapsedMinutes);
};

// Determine status based on remaining time
const getETAStatus = (remainingMinutes: number): ETAStatus => {
    if (remainingMinutes > 0) return 'on_time';
    if (remainingMinutes >= -5) return 'delayed'; // 5 minute grace period
    return 'overdue';
};

// Format remaining time for display
const formatRemainingTime = (minutes: number): string => {
    if (minutes > 0) {
        return `~${minutes} mnt`;
    } else if (minutes >= -5) {
        return `Segera tiba`;
    } else {
        return `Terlambat ${Math.abs(minutes)} mnt`;
    }
};

// Get status indicator emoji
const getStatusIndicator = (status: ETAStatus): string => {
    switch (status) {
        case 'on_time': return '🟢';
        case 'delayed': return '🟡';
        case 'overdue': return '🔴';
    }
};

const IncomingTrucksPanel: React.FC<IncomingTrucksPanelProps> = ({
    trucks,
    isDarkMode,
    theme
}) => {
    // Calculate live ETA status for each truck
    const trucksWithLiveStatus = useMemo(() => {
        return trucks.map(truck => {
            const remainingMinutes = calculateRemainingMinutes(truck.departed_at, truck.eta_minutes);
            const liveStatus = getETAStatus(remainingMinutes);
            return {
                ...truck,
                remainingMinutes,
                liveStatus
            };
        }).sort((a, b) => a.remainingMinutes - b.remainingMinutes); // Closest arrivals first
    }, [trucks]);

    return (
        <div className={`incoming-trucks-panel ${isDarkMode ? 'dark' : ''} ${theme.card}`}>
            <div className="incoming-trucks-header">
                <h3 className="incoming-trucks-title">
                    <Truck size={18} />
                    Truk Dalam Perjalanan
                </h3>
                <span className="incoming-trucks-count">{trucks.length}</span>
            </div>

            {trucksWithLiveStatus.length === 0 ? (
                <div className="incoming-trucks-empty">
                    <div className="incoming-trucks-empty-icon">🛣️</div>
                    <span>Tidak ada truk dalam perjalanan</span>
                </div>
            ) : (
                <div className="incoming-trucks-list">
                    {trucksWithLiveStatus.map(truck => (
                        <div
                            key={truck.id}
                            className={`incoming-truck-item ${truck.liveStatus === 'overdue' ? 'overdue' : ''}`}
                        >
                            <div className="truck-nopol">{truck.nopol}</div>

                            <div className="truck-location">
                                <span className="truck-location-name">
                                    <MapPin size={10} style={{ display: 'inline', marginRight: 4 }} />
                                    {truck.location}
                                </span>
                                <span className="truck-location-distance">
                                    {truck.distance_km} km dari pabrik
                                </span>
                            </div>

                            <div className={`truck-eta ${truck.liveStatus}`}>
                                <span>{getStatusIndicator(truck.liveStatus)}</span>
                                <Clock size={12} />
                                <span>{formatRemainingTime(truck.remainingMinutes)}</span>
                            </div>

                            <div className="truck-arrival-indicator">
                                <ArrowRight size={14} />
                                <div className="arrival-dot"></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default IncomingTrucksPanel;
