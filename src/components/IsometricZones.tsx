import React from 'react';
import { Scale, Clock, Factory, CheckCircle, LogIn } from 'lucide-react';
import type { YardStatus } from '../types';

interface ZoneProps {
    isOver: boolean;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent, status: YardStatus) => void;
    capacity?: { current: number; max: number };
}

// Gate Zone
export const ZoneGate: React.FC<ZoneProps> = () => (
    <g className="zone-gate">
        {/* Gate Structure */}
        <path
            d="M 50,150 L 100,120 L 100,250 L 50,280 Z"
            fill="#e2e8f0"
            stroke="#94a3b8"
            strokeWidth="2"
            opacity="0.7"
        />

        {/* Gate Arch */}
        <path
            d="M 60,200 L 90,185 L 90,220 L 60,235 Z"
            fill="#cbd5e1"
            stroke="#64748b"
            strokeWidth="1.5"
        />

        {/* Icon */}
        <foreignObject x="60" y="150" width="30" height="30">
            <LogIn size={20} className="text-slate-600" />
        </foreignObject>

        {/* Label */}
        <text x="75" y="300" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#475569">
            GERBANG
        </text>
    </g>
);

// Weighbridge Zone
export const ZoneWeighbridge: React.FC<ZoneProps> = ({ isOver, onDragOver, onDrop }) => (
    <g
        className={`zone-weighbridge ${isOver ? 'zone-hover' : ''}`}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, 'queue_weigh_in')}
    >
        {/* Platform Base */}
        <path
            d="M 150,200 L 250,150 L 350,200 L 250,250 Z"
            fill="#f1f5f9"
            stroke="#64748b"
            strokeWidth="3"
            strokeDasharray="5,5"
        />

        {/* Scale Platform */}
        <path
            d="M 180,210 L 250,175 L 320,210 L 250,245 Z"
            fill="#cbd5e1"
            stroke="#475569"
            strokeWidth="2"
        />

        {/* Scale Lines */}
        <line x1="200" y1="220" x2="300" y2="200" stroke="#64748b" strokeWidth="1" />
        <line x1="210" y1="227" x2="310" y2="207" stroke="#64748b" strokeWidth="1" />
        <line x1="220" y1="234" x2="320" y2="214" stroke="#64748b" strokeWidth="1" />

        {/* Icon */}
        <foreignObject x="230" y="195" width="40" height="40">
            <Scale size={24} className="text-slate-700" />
        </foreignObject>

        {/* Label */}
        <text x="250" y="270" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1e293b">
            TIMBANGAN
        </text>
    </g>
);

// Queue/Waiting Area
export const ZoneQueue: React.FC<ZoneProps> = ({ isOver, onDragOver, onDrop }) => (
    <g
        className={`zone-queue ${isOver ? 'zone-hover' : ''}`}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, 'waiting_unload')}
    >
        {/* Parking Area Ground */}
        <path
            d="M 400,250 L 550,180 L 700,250 L 550,320 Z"
            fill="#fef3c7"
            fillOpacity="0.4"
            stroke="#f59e0b"
            strokeWidth="3"
            strokeDasharray="8,4"
        />

        {/* Parking Grid Lines */}
        <line x1="450" y1="265" x2="500" y2="240" stroke="#fbbf24" strokeWidth="1.5" opacity="0.5" />
        <line x1="500" y1="240" x2="550" y2="265" stroke="#fbbf24" strokeWidth="1.5" opacity="0.5" />
        <line x1="550" y1="265" x2="600" y2="240" stroke="#fbbf24" strokeWidth="1.5" opacity="0.5" />

        {/* Icon */}
        <foreignObject x="530" y="255" width="40" height="40">
            <Clock size={28} className="text-yellow-600" />
        </foreignObject>

        {/* Label */}
        <text x="550" y="345" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#92400e">
            AREA TUNGGU
        </text>
    </g>
);

// Loading Ramp Zone
interface RampZoneProps extends ZoneProps {
    rampNumber: 1 | 2;
    yOffset: number;
}

export const ZoneRamp: React.FC<RampZoneProps> = ({
    rampNumber,
    yOffset,
    isOver,
    onDragOver,
    onDrop,
    capacity
}) => {
    const status: YardStatus = rampNumber === 1 ? 'ramp_1' : 'ramp_2';
    const isFull = capacity && capacity.current >= capacity.max;

    return (
        <g
            className={`zone-ramp ${isOver ? 'zone-hover' : ''}`}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, status)}
            transform={`translate(0, ${yOffset})`}
        >
            {/* Ramp Platform */}
            <path
                d="M 750,150 L 950,80 L 1100,150 L 900,220 Z"
                fill={isFull ? '#fecaca' : '#d1fae5'}
                fillOpacity="0.6"
                stroke={isFull ? '#dc2626' : '#10b981'}
                strokeWidth="4"
            />

            {/* Ramp Structure (3D effect) */}
            <path
                d="M 900,220 L 1100,150 L 1100,170 L 900,240 Z"
                fill={isFull ? '#fee2e2' : '#a7f3d0'}
                opacity="0.8"
            />

            {/* Ramp Loading Bay */}
            <rect
                x="800"
                y="140"
                width="80"
                height="60"
                fill="#6b7280"
                stroke="#374151"
                strokeWidth="2"
                opacity="0.7"
                transform="skewY(-10)"
            />

            {/* Icon */}
            <foreignObject x="900" y="155" width="40" height="40">
                <Factory size={28} className={isFull ? 'text-red-600' : 'text-green-600'} />
            </foreignObject>

            {/* Capacity Badge */}
            {capacity && (
                <g transform="translate(1000, 140)">
                    <rect
                        x="-30"
                        y="-12"
                        width="60"
                        height="24"
                        fill={isFull ? '#dc2626' : '#10b981'}
                        rx="4"
                    />
                    <text
                        x="0"
                        y="4"
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="bold"
                        fill="white"
                    >
                        {capacity.current}/{capacity.max}
                    </text>
                </g>
            )}

            {/* Full Indicator */}
            {isFull && (
                <g transform="translate(950, 110)">
                    <rect
                        x="-25"
                        y="-10"
                        width="50"
                        height="20"
                        fill="#dc2626"
                        rx="3"
                        className="pulse-badge"
                    />
                    <text
                        x="0"
                        y="4"
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="bold"
                        fill="white"
                    >
                        PENUH
                    </text>
                </g>
            )}

            {/* Label */}
            <text x="925" y="260" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#065f46">
                RAMP {rampNumber}
            </text>
        </g>
    );
};

// Exit Zone
export const ZoneExit: React.FC<ZoneProps> = ({ isOver, onDragOver, onDrop }) => (
    <g
        className={`zone-exit ${isOver ? 'zone-hover' : ''}`}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, 'finished')}
    >
        {/* Exit Lane */}
        <path
            d="M 750,450 L 900,390 L 1050,450 L 900,510 Z"
            fill="#dbeafe"
            fillOpacity="0.5"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeDasharray="10,5"
        />

        {/* Exit Arrow */}
        <path
            d="M 950,440 L 980,455 L 950,470 L 950,460 L 920,460 L 920,450 Z"
            fill="#3b82f6"
            opacity="0.8"
        />

        {/* Icon */}
        <foreignObject x="880" y="420" width="40" height="40">
            <CheckCircle size={28} className="text-blue-600" />
        </foreignObject>

        {/* Label */}
        <text x="900" y="535" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1e40af">
            KELUAR
        </text>
    </g>
);

// Background Grid
export const IsometricGrid: React.FC = () => (
    <g className="isometric-grid" opacity="0.15">
        {/* Horizontal Lines */}
        {Array.from({ length: 15 }, (_, i) => (
            <line
                key={`h-${i}`}
                x1="0"
                y1={i * 50}
                x2="1200"
                y2={i * 50}
                stroke="#64748b"
                strokeWidth="0.5"
            />
        ))}
        {/* Vertical Lines */}
        {Array.from({ length: 20 }, (_, i) => (
            <line
                key={`v-${i}`}
                x1={i * 60}
                y1="0"
                x2={i * 60}
                y2="700"
                stroke="#64748b"
                strokeWidth="0.5"
            />
        ))}
    </g>
);
