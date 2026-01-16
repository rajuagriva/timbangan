import React, { useState, useMemo } from 'react';
import TruckAsset3D from './TruckAsset3D';
import {
    ZoneGate,
    ZoneWeighbridge,
    ZoneQueue,
    ZoneRamp,
    ZoneExit,
    IsometricGrid,
} from './IsometricZones';
import type { YardTruck, YardStatus } from '../types';
import './YardCanvas3D.css';

interface YardCanvas3DProps {
    yardTrucks: YardTruck[];
    onMoveTruck: (truckId: string, newStatus: YardStatus) => void;
    draggedTruckId: string | null;
    onDragStart: (e: React.DragEvent, id: string) => void;
    formatIndoTime: (date: Date) => string;
}

// Coordinate mapping for truck positions based on status
const getPositionForTruck = (truck: YardTruck, index: number): { x: number; y: number } => {
    const basePositions: Record<YardStatus, { x: number; y: number }> = {
        queue_weigh_in: { x: 200, y: 200 },
        waiting_unload: { x: 550, y: 285 },
        ramp_1: { x: 900, y: 175 },
        ramp_2: { x: 900, y: 405 },
        finished: { x: 900, y: 475 },
    };

    const base = basePositions[truck.status];

    // Offset trucks in the same zone
    const offsetX = (index % 3) * 70; // Horizontal spacing
    const offsetY = Math.floor(index / 3) * 50; // Vertical spacing for overflow

    return {
        x: base.x + offsetX,
        y: base.y + offsetY,
    };
};

const YardCanvas3D: React.FC<YardCanvas3DProps> = ({
    yardTrucks,
    onMoveTruck,
    draggedTruckId,
    onDragStart,
    formatIndoTime,
}) => {
    const [hoveredTruck, setHoveredTruck] = useState<string | null>(null);
    const [dragOverZone, setDragOverZone] = useState<YardStatus | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);

    // Group trucks by status for positioning
    const trucksByStatus = useMemo(() => {
        const grouped: Record<YardStatus, YardTruck[]> = {
            queue_weigh_in: [],
            waiting_unload: [],
            ramp_1: [],
            ramp_2: [],
            finished: [],
        };

        yardTrucks.forEach((truck) => {
            grouped[truck.status].push(truck);
        });

        return grouped;
    }, [yardTrucks]);

    // Calculate ramp capacities
    const ramp1Capacity = { current: trucksByStatus.ramp_1.length, max: 3 };
    const ramp2Capacity = { current: trucksByStatus.ramp_2.length, max: 3 };

    // Drag handlers
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, status: YardStatus) => {
        e.preventDefault();
        const truckId = e.dataTransfer.getData('truckId');
        if (truckId) {
            onMoveTruck(truckId, status);
        }
        setDragOverZone(null);
    };

    const handleZoneDragEnter = (status: YardStatus) => {
        setDragOverZone(status);
    };

    const handleZoneDragLeave = () => {
        setDragOverZone(null);
    };

    // Truck click handler
    const handleTruckClick = (truck: YardTruck) => {
        // You can implement a modal here or handle click differently
        console.log('Truck clicked:', truck);
    };

    // Mouse handlers for tooltip
    const handleTruckMouseEnter = (truck: YardTruck, e: React.MouseEvent) => {
        setHoveredTruck(truck.id);
        const svg = e.currentTarget.closest('svg');
        if (svg) {
            const point = svg.createSVGPoint();
            point.x = e.clientX;
            point.y = e.clientY;
            const svgPoint = point.matrixTransform(svg.getScreenCTM()?.inverse());
            setTooltipPosition({ x: svgPoint.x, y: svgPoint.y });
        }
    };

    const handleTruckMouseLeave = () => {
        setHoveredTruck(null);
        setTooltipPosition(null);
    };

    const hoveredTruckData = hoveredTruck
        ? yardTrucks.find((t) => t.id === hoveredTruck)
        : null;

    return (
        <div className="yard-canvas-container">
            <svg
                viewBox="0 0 1200 600"
                className="yard-canvas-3d"
                preserveAspectRatio="xMidYMid meet"
            >
                {/* Background Grid */}
                <IsometricGrid />

                {/* Roads/Paths (decorative) */}
                <path
                    d="M 100,200 Q 250,180 400,250 T 700,280 T 900,450"
                    className="yard-road"
                />

                {/* Zones */}
                <ZoneGate
                    isOver={false}
                    onDragOver={() => { }}
                    onDrop={() => { }}
                />

                <ZoneWeighbridge
                    isOver={dragOverZone === 'queue_weigh_in'}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                />

                <g
                    onDragEnter={() => handleZoneDragEnter('queue_weigh_in')}
                    onDragLeave={handleZoneDragLeave}
                >
                    <ZoneWeighbridge
                        isOver={dragOverZone === 'queue_weigh_in'}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    />
                </g>

                <g
                    onDragEnter={() => handleZoneDragEnter('waiting_unload')}
                    onDragLeave={handleZoneDragLeave}
                >
                    <ZoneQueue
                        isOver={dragOverZone === 'waiting_unload'}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    />
                </g>

                <g
                    onDragEnter={() => handleZoneDragEnter('ramp_1')}
                    onDragLeave={handleZoneDragLeave}
                >
                    <ZoneRamp
                        rampNumber={1}
                        yOffset={0}
                        isOver={dragOverZone === 'ramp_1'}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        capacity={ramp1Capacity}
                    />
                </g>

                <g
                    onDragEnter={() => handleZoneDragEnter('ramp_2')}
                    onDragLeave={handleZoneDragLeave}
                >
                    <ZoneRamp
                        rampNumber={2}
                        yOffset={230}
                        isOver={dragOverZone === 'ramp_2'}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        capacity={ramp2Capacity}
                    />
                </g>

                <g
                    onDragEnter={() => handleZoneDragEnter('finished')}
                    onDragLeave={handleZoneDragLeave}
                >
                    <ZoneExit
                        isOver={dragOverZone === 'finished'}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    />
                </g>

                {/* Render Trucks */}
                {Object.entries(trucksByStatus).flatMap(([, trucks]) =>
                    trucks.map((truck, index) => {
                        const position = getPositionForTruck(truck, index);
                        return (
                            <g
                                key={truck.id}
                                onMouseEnter={(e) => handleTruckMouseEnter(truck, e)}
                                onMouseLeave={handleTruckMouseLeave}
                            >
                                <TruckAsset3D
                                    truck={truck}
                                    position={position}
                                    isDragging={draggedTruckId === truck.id}
                                    onClick={() => handleTruckClick(truck)}
                                    onDragStart={onDragStart}
                                />
                            </g>
                        );
                    })
                )}

                {/* Tooltip */}
                {hoveredTruckData && tooltipPosition && (
                    <g transform={`translate(${tooltipPosition.x + 20}, ${tooltipPosition.y - 60})`}>
                        <rect
                            x="0"
                            y="0"
                            width="180"
                            height="80"
                            fill="rgba(15, 23, 42, 0.95)"
                            stroke="rgba(148, 163, 184, 0.3)"
                            strokeWidth="1"
                            rx="8"
                        />
                        <text
                            x="10"
                            y="20"
                            fontSize="12"
                            fontWeight="bold"
                            fill="#60a5fa"
                            fontFamily="monospace"
                        >
                            {hoveredTruckData.nopol}
                        </text>
                        <text x="10" y="38" fontSize="10" fill="#94a3b8">
                            Asal:
                        </text>
                        <text x="90" y="38" fontSize="10" fill="#e2e8f0" fontWeight="600">
                            {hoveredTruckData.source}
                        </text>
                        <text x="10" y="54" fontSize="10" fill="#94a3b8">
                            Tiba:
                        </text>
                        <text x="90" y="54" fontSize="10" fill="#e2e8f0" fontWeight="600">
                            {formatIndoTime(new Date(hoveredTruckData.arrived_at))}
                        </text>
                        <text x="10" y="70" fontSize="10" fill="#94a3b8">
                            Status:
                        </text>
                        <text x="90" y="70" fontSize="10" fill="#34d399" fontWeight="600">
                            {hoveredTruckData.status.replace('_', ' ').toUpperCase()}
                        </text>
                    </g>
                )}
            </svg>

            {/* Legend */}
            <div
                style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'rgba(15, 23, 42, 0.9)',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '11px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                }}
            >
                <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '12px' }}>
                    Status Truk
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <div
                        style={{
                            width: '16px',
                            height: '16px',
                            background: '#fbbf24',
                            borderRadius: '3px',
                        }}
                    />
                    <span>Menunggu</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <div
                        style={{
                            width: '16px',
                            height: '16px',
                            background: '#34d399',
                            borderRadius: '3px',
                        }}
                    />
                    <span>Bongkar</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                        style={{
                            width: '16px',
                            height: '16px',
                            background: '#60a5fa',
                            borderRadius: '3px',
                        }}
                    />
                    <span>Selesai</span>
                </div>
            </div>
        </div>
    );
};

export default YardCanvas3D;
