'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Navbar } from '@/components/navbar'

export function SettingsPage({ onNavigate, onLogout, currentPage }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [settings, setSettings] = useState({
    notifications: true,
    alerts: true,
    theme: 'dark',
    refreshRate: '3s',
  })

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={onLogout} onNavigate={onNavigate} currentPage={currentPage} />

      <div className="flex-1 flex flex-col w-full md:pl-64">
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} onLogout={onLogout} />

        <main className="p-6 space-y-6 flex-1 overflow-auto">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
            <p className="text-muted-foreground">Configure your dashboard preferences</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 space-y-6 max-w-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Push Notifications</h3>
                <p className="text-sm text-muted-foreground">Receive alerts on your device</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, notifications: !settings.notifications })}
                className={`w-12 h-6 rounded-full transition-colors ${settings.notifications ? 'bg-green-500' : 'bg-gray-400'}`}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Email Alerts</h3>
                <p className="text-sm text-muted-foreground">Get email notifications for anomalies</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, alerts: !settings.alerts })}
                className={`w-12 h-6 rounded-full transition-colors ${settings.alerts ? 'bg-green-500' : 'bg-gray-400'}`}
              />
            </div>

            <div>
              <label className="block font-medium mb-2">Dashboard Theme</label>
              <select
                value={settings.theme}
                onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="auto">Auto</option>
              </select>
            </div>

            <div>
              <label className="block font-medium mb-2">Data Refresh Rate</label>
              <select
                value={settings.refreshRate}
                onChange={(e) => setSettings({ ...settings, refreshRate: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2"
              >
                <option value="1s">1 Second</option>
                <option value="3s">3 Seconds</option>
                <option value="5s">5 Seconds</option>
                <option value="10s">10 Seconds</option>
              </select>
            </div>

            <button className="w-full bg-primary text-primary-foreground rounded-lg py-2 font-medium hover:opacity-90">
              Save Settings
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}
