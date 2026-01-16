import React, { useState } from 'react';
import { Calendar, PenTool, DollarSign, CloudRain, Briefcase } from 'lucide-react';
import type { EventAnnotation, EventType } from '../../types';

// --- CONSTANTS ---
export const EVENT_TYPES: { type: EventType; label: string; color: string; icon: any }[] = [
    { type: 'holiday', label: 'Libur', color: '#ef4444', icon: Calendar },
    { type: 'maintenance', label: 'Maintenance', color: '#f97316', icon: PenTool },
    { type: 'price_change', label: 'Harga', color: '#eab308', icon: DollarSign },
    { type: 'weather', label: 'Cuaca', color: '#3b82f6', icon: CloudRain },
    { type: 'other', label: 'Lainnya', color: '#6b7280', icon: Briefcase },
];

// Generate dynamic mock events based on current date to ensure they appear on chart
const generateMockEvents = (): EventAnnotation[] => {
    const today = new Date();
    const events: EventAnnotation[] = [];

    // Add some events around today
    for (let i = -5; i < 5; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];

        if (i === -2) events.push({ date: dateStr, type: 'price_change', title: 'Kenaikan Harga', description: 'Naik Rp 50' });
        if (i === 0) events.push({ date: dateStr, type: 'weather', title: 'Hujan Deras', description: 'Curah hujan > 20mm' });
        if (i === 3) events.push({ date: dateStr, type: 'maintenance', title: 'Maintenance', description: 'Kalibrasi Rutin' });
    }
    return events;
};

export const MOCK_EVENTS: EventAnnotation[] = generateMockEvents();

// --- COMPONENTS ---

// 1. Filter Control
interface AnnotationFilterProps {
    selectedTypes: EventType[];
    onToggle: (type: EventType) => void;
}

export const AnnotationFilter: React.FC<AnnotationFilterProps> = ({ selectedTypes, onToggle }) => {
    return (
        <div className="flex flex-wrap gap-2 mb-4 animate-in fade-in slide-in-from-top-1">
            <span className="text-xs font-bold text-slate-500 self-center mr-2">Marker:</span>
            {EVENT_TYPES.map((et) => {
                const isSelected = selectedTypes.includes(et.type);
                const Icon = et.icon;
                return (
                    <button
                        key={et.type}
                        onClick={() => onToggle(et.type)}
                        className={`
                            flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] md:text-xs font-semibold transition-all border
                            ${isSelected
                                ? 'bg-white shadow-sm border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                                : 'bg-slate-50 border-transparent text-slate-400 dark:bg-slate-800/20 dark:text-slate-600 grayscale'}
                        `}
                        style={{
                            color: isSelected ? et.color : undefined,
                            borderColor: isSelected ? et.color : undefined
                        }}
                    >
                        <Icon size={12} />
                        {et.label}
                    </button>
                );
            })}
        </div>
    );
};

// 2. Custom Marker Label for ReferenceLine
export const AnnotationMarkerLabel = (props: any) => {
    const { viewBox, event } = props;
    const { x, y } = viewBox;

    if (!event) return null;

    const eventConfig = EVENT_TYPES.find(e => e.type === event.type) || EVENT_TYPES[4];
    const Icon = eventConfig.icon;

    // Position the icon at the top of the line
    return (
        <g transform={`translate(${x - 12},${y})`}>
            {/* Tooltip trigger area */}
            <circle cx="12" cy="12" r="14" fill={eventConfig.color} fillOpacity={0.1} />
            <circle cx="12" cy="12" r="9" fill="white" stroke={eventConfig.color} strokeWidth={2} />
            <foreignObject x="4" y="4" width="16" height="16">
                <div className="flex items-center justify-center w-full h-full" style={{ color: eventConfig.color }}>
                    <Icon size={12} strokeWidth={2.5} />
                </div>
            </foreignObject>
            <title>{`${event.title}\n${event.description}`}</title>
        </g>
    );
};

// --- HOOK ---
export const useEventAnnotations = (initialEvents: EventAnnotation[] = MOCK_EVENTS) => {
    const [selectedTypes, setSelectedTypes] = useState<EventType[]>(['holiday', 'maintenance', 'price_change', 'weather', 'other']);

    const toggleType = (type: EventType) => {
        setSelectedTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    const filteredEvents = initialEvents.filter(e => selectedTypes.includes(e.type));

    return {
        selectedTypes,
        toggleType,
        filteredEvents
    };
};
