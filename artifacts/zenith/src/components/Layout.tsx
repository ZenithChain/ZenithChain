import { ReactNode } from 'react'
import { Link, useLocation } from 'wouter'
import { ConnectWalletButton } from './ConnectWalletButton'
import { Logo } from './Logo'
import {
  Home,
  Target,
  Droplet,
  CalendarCheck,
  Package,
  Trophy,
  Search,
  Users,
  ExternalLink,
} from 'lucide-react'

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Missions', href: '/missions', icon: Target },
  { name: 'Faucet', href: '/faucet', icon: Droplet },
  { name: 'Check-in', href: '/checkin', icon: CalendarCheck },
  { name: 'Boxes', href: '/boxes', icon: Package },
  { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  { name: 'Referrals', href: '/referrals', icon: Users },
]

const EXPLORER_URL = 'https://explorer.zenithchain.xyz'

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation()

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] mix-blend-screen opacity-50" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] mix-blend-screen opacity-50" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      </div>

      {/* Top Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/70 backdrop-blur-xl">
        <div className="container flex h-16 items-center px-4 md:px-6">
          <div className="mr-8 flex items-center">
            <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
              <Logo size="md" />
            </Link>
          </div>

          <nav className="hidden lg:flex items-center space-x-1 text-sm font-medium">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
            <a
              href={EXPLORER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50"
            >
              <Search className="h-4 w-4" />
              Explorer
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>
          </nav>

          <div className="ml-auto flex items-center space-x-3">
            <ConnectWalletButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10 pb-20 lg:pb-0">{children}</main>

      {/* Footer */}
      <footer className="hidden lg:block relative z-10 border-t border-border/40 bg-background/40 backdrop-blur-sm py-6 mt-12">
        <div className="container px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Logo size="sm" showText={false} />
            <span>
              Zenith Testnet · ChainID 95749 ·{' '}
              <a
                href="https://rpc.zenithchain.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                rpc.zenithchain.xyz
              </a>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={EXPLORER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors flex items-center gap-1"
            >
              Explorer <ExternalLink className="h-3 w-3" />
            </a>
            <span>© 2026 Zenith</span>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around h-16 bg-background/90 backdrop-blur-xl border-t border-border/40 px-1 safe-area-bottom">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon
          const isActive = location === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-0.5 transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
