import React from 'react';
import type { YardTruck, YardStatus } from '../types';

interface TruckAsset3DProps {
    truck: YardTruck;
    position: { x: number; y: number };
    isDragging: boolean;
    onClick: () => void;
    onDragStart: (e: React.DragEvent, id: string) => void;
}

// Get color based on truck status
const getStatusColor = (status: YardStatus) => {
    switch (status) {
        case 'queue_weigh_in':
        case 'waiting_unload':
            return { primary: '#fbbf24', secondary: '#f59e0b', label: 'Menunggu' }; // Yellow
        case 'ramp_1':
        case 'ramp_2':
            return { primary: '#34d399', secondary: '#10b981', label: 'Bongkar' }; // Green
        case 'finished':
            return { primary: '#60a5fa', secondary: '#3b82f6', label: 'Selesai' }; // Blue
        default:
            return { primary: '#94a3b8', secondary: '#64748b', label: 'Unknown' }; // Gray
    }
};

const TruckAsset3D: React.FC<TruckAsset3DProps> = ({
    truck,
    position,
    isDragging,
    onClick,
    onDragStart,
}) => {
    const colors = getStatusColor(truck.status);

    return (
        <g
            className={`truck-asset ${isDragging ? 'dragging' : ''}`}
            transform={`translate(${position.x}, ${position.y})`}
            onClick={onClick}
            onDragStart={(e) => onDragStart(e, truck.id)}
            style={{ cursor: 'pointer' }}
        >
            {/* Isometric Truck Body - Using parallelogram shape */}
            <g className="truck-body">
                {/* Shadow */}
                <ellipse
                    cx="0"
                    cy="35"
                    rx="28"
                    ry="8"
                    fill="rgba(0,0,0,0.2)"
                    className="truck-shadow"
                />

                {/* Truck Cabin (Front) */}
                <path
                    d="M -15,-10 L -5,-15 L 5,-15 L 15,-10 L 15,5 L -15,5 Z"
                    fill={colors.primary}
                    stroke={colors.secondary}
                    strokeWidth="1.5"
                    className="truck-cabin"
                />

                {/* Truck Cargo (Back) - Isometric box */}
                <path
                    d="M -20,5 L -10,0 L 20,0 L 30,5 L 30,25 L -20,25 Z"
                    fill={colors.secondary}
                    stroke={colors.primary}
                    strokeWidth="1.5"
                    className="truck-cargo"
                />

                {/* Cargo Top (isometric) */}
                <path
                    d="M -20,5 L -10,0 L 20,0 L 30,5 L 20,10 L -10,10 Z"
                    fill={colors.primary}
                    opacity="0.8"
                    className="truck-cargo-top"
                />

                {/* Cargo Side Detail */}
                <path
                    d="M 30,5 L 30,25 L 20,30 L 20,10 Z"
                    fill={colors.primary}
                    opacity="0.6"
                    className="truck-cargo-side"
                />

                {/* Wheels */}
                <circle cx="-10" cy="26" r="4" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />
                <circle cx="10" cy="26" r="4" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />
                <circle cx="20" cy="26" r="4" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />

                {/* Window */}
                <rect
                    x="-8"
                    y="-8"
                    width="10"
                    height="8"
                    fill="#93c5fd"
                    opacity="0.7"
                    rx="1"
                />
            </g>

            {/* Status Badge */}
            {!isDragging && (
                <g className="truck-badge" transform="translate(0, -25)">
                    <rect
                        x="-25"
                        y="-8"
                        width="50"
                        height="14"
                        fill="rgba(15, 23, 42, 0.9)"
                        rx="3"
                    />
                    <text
                        x="0"
                        y="2"
                        textAnchor="middle"
                        fontSize="8"
                        fontWeight="bold"
                        fill="white"
                        fontFamily="monospace"
                    >
                        {truck.nopol}
                    </text>
                </g>
            )}

            {/* Loading Indicator for active unloading */}
            {(truck.status === 'ramp_1' || truck.status === 'ramp_2') && !isDragging && (
                <g className="loading-indicator" transform="translate(0, -35)">
                    <circle
                        cx="0"
                        cy="0"
                        r="3"
                        fill="#34d399"
                        className="pulse-dot"
                    >
                        <animate
                            attributeName="opacity"
                            values="1;0.3;1"
                            dur="1.5s"
                            repeatCount="indefinite"
                        />
                    </circle>
                </g>
            )}

            {/* Hover Tooltip Background (invisible hitbox) */}
            <rect
                x="-35"
                y="-30"
                width="70"
                height="70"
                fill="transparent"
                className="truck-hitbox"
            />
        </g>
    );
};

export default TruckAsset3D;
