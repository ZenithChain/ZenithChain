import { ReactNode } from 'react'
import { Link, useLocation } from 'wouter'
import { ConnectWalletButton } from './ConnectWalletButton'
import { 
  Home, 
  Target, 
  Droplet, 
  CalendarCheck, 
  Package, 
  Trophy, 
  Search, 
  Users
} from 'lucide-react'

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Missions', href: '/missions', icon: Target },
  { name: 'Faucet', href: '/faucet', icon: Droplet },
  { name: 'Check-in', href: '/checkin', icon: CalendarCheck },
  { name: 'Boxes', href: '/boxes', icon: Package },
  { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  { name: 'Explorer', href: '/explorer', icon: Search },
  { name: 'Referrals', href: '/referrals', icon: Users },
]

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation()

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] mix-blend-screen opacity-50" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] mix-blend-screen opacity-50" />
      </div>

      {/* Top Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center px-4 md:px-6">
          <div className="mr-8 flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold text-2xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                ZENITH
              </span>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {navItems.map((item) => (
              <Link 
                key={item.href}
                href={item.href}
                className={`transition-colors hover:text-primary ${location === item.href ? 'text-primary' : 'text-muted-foreground'}`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          
          <div className="ml-auto flex items-center space-x-4">
            <ConnectWalletButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10 pb-20 md:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around h-16 bg-background/80 backdrop-blur-xl border-t border-border/40 px-2 safe-area-bottom">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon
          const isActive = location === item.href
          return (
            <Link 
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
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
