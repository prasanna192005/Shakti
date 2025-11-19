'use client'

interface NavbarProps {
  onMenuClick: () => void
  onLogout: () => void
}

export function Navbar({ onMenuClick, onLogout }: NavbarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:left-64">
      <div className="flex items-center justify-between px-6 py-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <h1 className="text-xl font-bold hidden md:block">Energy Grid Monitor</h1>

        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-muted rounded-lg transition-colors" aria-label="Notifications">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <button className="p-2 hover:bg-muted rounded-lg transition-colors" aria-label="User profile">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button
            onClick={onLogout}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-muted hover:bg-muted/80 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
