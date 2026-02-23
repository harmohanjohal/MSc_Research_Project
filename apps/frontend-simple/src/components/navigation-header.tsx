"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeft, Thermometer, AlertTriangle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ApiStatus } from '@/components/ui/error-boundary'
import { useApiConnection } from '@/hooks/useApi'
import { cn } from '@/lib/utils'

interface NavigationHeaderProps {
  title?: string
  showBackButton?: boolean
}

const navigationItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/weather', label: 'Weather' },
  { href: '/predictions', label: 'Predictions' },
  { href: '/explanation', label: 'How It Works' },
  { href: '/validation', label: 'Validation' },
  { href: '/plant-control', label: 'Plant Control' },
  { href: '/manual-testing', label: 'Manual Testing' },
]

export function NavigationHeader({ title, showBackButton }: NavigationHeaderProps) {
  const shouldShowBackButton = showBackButton === true
  const pathname = usePathname()
  const { isConnected, lastCheck, checkConnection } = useApiConnection()
  
  const [showDisclaimer, setShowDisclaimer] = useState(true)

  useEffect(() => {
    const hasSeenDisclaimer = sessionStorage.getItem('hasSeenResearchDisclaimer')
    if (hasSeenDisclaimer) {
      setShowDisclaimer(false)
    }
  }, [])

  const dismissDisclaimer = () => {
    sessionStorage.setItem('hasSeenResearchDisclaimer', 'true')
    setShowDisclaimer(false)
  }

  return (
    <div className="sticky top-0 z-50 flex flex-col">
      {showDisclaimer && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-200/90 text-xs px-4 py-2 flex items-start sm:items-center justify-between gap-4 font-mono w-full backdrop-blur-md">
          <div className="flex items-start sm:items-center gap-2 max-w-7xl mx-auto w-full">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
            <p className="flex-1 leading-relaxed">
              <strong className="text-amber-400">RESEARCH PROJECT DISCLAIMER:</strong> This interface and its predictive models are part of an MSc research project. The district heating predictions provided are for demonstration and academic purposes only, and may contain inaccuracies. Do not use for actual physical plant control.
            </p>
            <button 
              onClick={dismissDisclaimer}
              className="p-1 hover:bg-amber-500/20 rounded text-amber-400 transition-colors shrink-0 flex items-center justify-center h-6 w-6"
              aria-label="Dismiss warning"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    <header className="border-b border-primary/20 bg-slate-950/80 backdrop-blur-md w-full font-mono">
      <div className="container mx-auto px-4 py-3 max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {shouldShowBackButton && (
              <Button variant="ghost" size="icon" asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
            )}
            <div className="flex items-center space-x-2">
              <Thermometer className="h-5 w-5 text-primary" />
              <h1 className="text-sm font-bold tracking-tighter text-white uppercase">
                {title || 'HEAT_DEMAND_PRED_V1.0'}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <ApiStatus
              isConnected={isConnected}
              lastCheck={lastCheck}
              onRetry={checkConnection}
            />

            <nav className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <Button
                  key={item.href}
                  variant={pathname === item.href ? "default" : "ghost"}
                  size="sm"
                  asChild
                  className={cn(
                    "text-[10px] uppercase tracking-widest h-8 px-3 transition-all",
                    pathname === item.href ? "bg-primary/20 text-primary border border-primary/30" : "text-muted-foreground hover:text-white"
                  )}
                >
                  <Link href={item.href}>{item.label}</Link>
                </Button>
              ))}
            </nav>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="lg:hidden mt-4 flex flex-wrap gap-2">
          {navigationItems.map((item) => (
            <Button
              key={item.href}
              variant={pathname === item.href ? "default" : "outline"}
              size="sm"
              asChild
              className="text-xs"
            >
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </nav>
      </div>
    </header>
    </div>
  )
}
