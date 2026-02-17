"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeft, Thermometer } from 'lucide-react'
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

  return (
    <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
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
              <Thermometer className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">
                {title || 'Heat Demand Predictor'}
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
  )
}
