'use client'

import { useState } from 'react'

interface GridNode {
  id: string
  lat: number
  lng: number
  voltage: number
  load: number
  status: 'online' | 'offline'
}

export function GeoMap() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  // Simulated grid node locations and data
  const nodes: GridNode[] = [
    { id: 'N1', lat: 40, lng: 30, voltage: 235, load: 45, status: 'online' },
    { id: 'N2', lat: 50, lng: 40, voltage: 238, load: 52, status: 'online' },
    { id: 'N3', lat: 35, lng: 55, voltage: 232, load: 38, status: 'online' },
    { id: 'N4', lat: 60, lng: 25, voltage: 240, load: 68, status: 'online' },
    { id: 'N5', lat: 45, lng: 65, voltage: 228, load: 22, status: 'offline' },
  ]

  return (
    <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6 shadow-lg">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Grid Node Map</h3>
          <p className="text-sm text-muted-foreground">Geographic distribution of grid nodes</p>
        </div>

        {/* Simulated SVG Map */}
        <div className="relative w-full h-64 bg-muted/30 rounded-lg border border-border/50 overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 100 80">
            {/* Grid background */}
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="var(--border)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100" height="80" fill="url(#grid)" />

            {/* Nodes */}
            {nodes.map((node) => (
              <g key={node.id}>
                <circle
                  cx={node.lng}
                  cy={node.lat}
                  r={hoveredNode === node.id ? 4 : 3}
                  fill={node.status === 'online' ? '#10b981' : '#ef4444'}
                  opacity="0.8"
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                />
                {hoveredNode === node.id && (
                  <circle
                    cx={node.lng}
                    cy={node.lat}
                    r={6}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.5"
                    className="text-primary"
                  />
                )}
              </g>
            ))}
          </svg>

          {/* Tooltip */}
          {hoveredNode && (
            <div className="absolute bottom-2 left-2 p-3 rounded-lg bg-card border border-border shadow-lg text-xs space-y-1 z-10">
              {nodes
                .filter((n) => n.id === hoveredNode)
                .map((node) => (
                  <div key={node.id}>
                    <p className="font-semibold">{node.id}</p>
                    <p className="text-muted-foreground">Voltage: {node.voltage}V</p>
                    <p className="text-muted-foreground">Load: {node.load}%</p>
                    <p className={node.status === 'online' ? 'text-green-600' : 'text-red-600'}>
                      {node.status.toUpperCase()}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          {nodes.map((node) => (
            <div key={node.id} className="p-2 rounded-lg bg-muted/50 border border-border">
              <p className="font-semibold">{node.id}</p>
              <p className="text-muted-foreground">V: {node.voltage}V</p>
              <p className="text-muted-foreground">Load: {node.load}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
