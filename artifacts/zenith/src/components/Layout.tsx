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
  Twitter,
  MessageCircle,
  Send,
  Award,
} from 'lucide-react'

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Missions', href: '/missions', icon: Target },
  { name: 'Badges', href: '/badges', icon: Award },
  { name: 'Faucet', href: '/faucet', icon: Droplet },
  { name: 'Check-in', href: '/checkin', icon: CalendarCheck },
  { name: 'Boxes', href: '/boxes', icon: Package },
  { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  { name: 'Referrals', href: '/referrals', icon: Users },
]

const EXPLORER_URL = 'https://explorer.zenithchain.xyz'
const RPC_URL = 'https://rpc.zenithchain.xyz'

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation()

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col relative overflow-x-hidden">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/85 backdrop-blur-xl">
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
      <footer className="relative z-10 border-t border-border/60 bg-card/40 backdrop-blur-sm pt-12 pb-24 lg:pb-8 mt-12">
        <div className="container px-4 md:px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            {/* Brand col */}
            <div className="md:col-span-2 space-y-4">
              <Logo size="md" />
              <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                Zenith is a high-throughput EVM testnet built for the next generation of
                Web3 builders. The Genesis Campaign rewards early participants with onchain
                reputation that carries into mainnet.
              </p>
              <div className="flex items-center gap-2">
                <a
                  href="https://x.com/zenithchain"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-lg border border-border hover:border-primary hover:bg-primary/5 hover:text-primary flex items-center justify-center text-muted-foreground transition-colors"
                  aria-label="X"
                >
                  <Twitter className="h-4 w-4" />
                </a>
                <a
                  href="https://discord.gg/zenithchain"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-lg border border-border hover:border-primary hover:bg-primary/5 hover:text-primary flex items-center justify-center text-muted-foreground transition-colors"
                  aria-label="Discord"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
                <a
                  href="https://t.me/zenithchain"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-lg border border-border hover:border-primary hover:bg-primary/5 hover:text-primary flex items-center justify-center text-muted-foreground transition-colors"
                  aria-label="Telegram"
                >
                  <Send className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-4">
                Network
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li className="text-muted-foreground">
                  Chain ID:{' '}
                  <span className="font-mono text-foreground">95749</span>
                </li>
                <li>
                  <a
                    href={RPC_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    RPC Endpoint
                  </a>
                </li>
                <li>
                  <a
                    href={EXPLORER_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                  >
                    Block Explorer
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li className="text-muted-foreground">
                  Native:{' '}
                  <span className="font-semibold text-foreground">ZTH</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-4">
                Resources
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="/missions" className="text-muted-foreground hover:text-primary transition-colors">
                    Missions
                  </Link>
                </li>
                <li>
                  <Link href="/leaderboard" className="text-muted-foreground hover:text-primary transition-colors">
                    Leaderboard
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/60 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <div>
              © 2026 Zenith Labs. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <Link href="/terms" className="hover:text-primary transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="hover:text-primary transition-colors">
                Privacy
              </Link>
              <span className="text-muted-foreground/60">·</span>
              <span>Testnet — No monetary value</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around h-16 bg-background/95 backdrop-blur-xl border-t border-border/60 px-1 safe-area-bottom">
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
