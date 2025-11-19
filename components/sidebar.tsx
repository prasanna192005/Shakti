'use client'

import { useState } from 'react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  onLogout: () => void
  onNavigate: (page: string) => void
  currentPage: string
}

export function Sidebar({ isOpen, onClose, onLogout, onNavigate, currentPage }: SidebarProps) {
  const navItems = [
    { label: 'Dashboard', id: 'dashboard' },
    { label: 'Real-time Monitoring', id: 'monitoring' },
    { label: 'Predictions', id: 'predictions' },
    { label: 'Anomalies', id: 'anomalies' },
    { label: 'Reports', id: 'reports' },
    { label: 'Settings', id: 'settings' },
  ]

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-64 bg-card border-r border-border transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center gap-3 mb-8 pt-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <span className="text-white text-lg font-bold">G</span>
            </div>
            <h2 className="font-bold text-lg">Smart Grid</h2>
          </div>

          <nav className="space-y-2 flex-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id)
                  onClose()
                }}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  currentPage === item.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted text-foreground'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <button
            onClick={onLogout}
            className="w-full px-4 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors duration-200 font-medium text-sm"
          >
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}
