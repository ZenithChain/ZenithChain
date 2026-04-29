import { useAccount, useConnect, useDisconnect, useSwitchChain, useChainId } from 'wagmi'
import { zenithTestnet, HAS_WALLETCONNECT } from '@/lib/wagmi'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Copy, LogOut, Wallet, AlertCircle, Loader2, ExternalLink, Check } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import { useConnectWallet } from '@workspace/api-client-react'
import { toast } from 'sonner'
import {
  pickIconForConnector,
  MetaMaskIcon,
  WalletConnectIcon,
  CoinbaseIcon,
  OkxIcon,
  TrustWalletIcon,
} from './WalletIcons'

const POPULAR_FALLBACKS = [
  {
    key: 'okx',
    label: 'OKX Wallet',
    subtitle: 'Browser extension',
    Icon: OkxIcon,
    install: 'https://www.okx.com/web3',
    detect: () =>
      typeof window !== 'undefined' &&
      ((window as any).okxwallet || (window as any).ethereum?.isOkxWallet),
  },
  {
    key: 'trust',
    label: 'Trust Wallet',
    subtitle: 'Browser extension',
    Icon: TrustWalletIcon,
    install: 'https://trustwallet.com/browser-extension',
    detect: () =>
      typeof window !== 'undefined' &&
      ((window as any).trustwallet || (window as any).ethereum?.isTrust),
  },
]

function descForConnector(c: { id: string; name: string }) {
  const id = c.id.toLowerCase()
  const name = c.name.toLowerCase()
  if (id === 'metamask' || name.includes('metamask')) return 'Most popular Web3 wallet'
  if (id === 'walletconnect') return 'Scan with mobile wallet'
  if (id.includes('coinbase')) return 'Connect with Coinbase'
  if (name.includes('okx')) return 'OKX browser extension'
  if (name.includes('trust')) return 'Trust Wallet extension'
  if (name.includes('rabby')) return 'Rabby browser wallet'
  if (name.includes('phantom')) return 'Phantom multi-chain'
  return 'Browser wallet extension'
}

export function ConnectWalletButton() {
  const { address, isConnected } = useAccount()
  const { connectors, connect, isPending, variables } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { switchChain, isPending: isSwitching } = useSwitchChain()
  const connectWalletMutation = useConnectWallet()

  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const isWrongChain = isConnected && chainId !== zenithTestnet.id

  useEffect(() => {
    if (isConnected && address) {
      const ref = localStorage.getItem('zenith_ref')
      connectWalletMutation.mutate(
        { data: { address, referralCode: ref } },
        { onError: () => {} },
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address])

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      toast.success('Address copied to clipboard')
      setTimeout(() => setCopied(false), 1500)
    }
  }

  const orderedConnectors = useMemo(() => {
    const priority = ['metaMask', 'walletConnect', 'coinbaseWalletSDK']
    const seenNames = new Set<string>()
    const out: Array<(typeof connectors)[number]> = []
    for (const id of priority) {
      const c = connectors.find((x) => x.id === id)
      if (c) {
        out.push(c)
        seenNames.add(c.name.toLowerCase())
      }
    }
    for (const c of connectors) {
      if (priority.includes(c.id)) continue
      if (c.id === 'injected') continue
      if (seenNames.has(c.name.toLowerCase())) continue
      out.push(c)
      seenNames.add(c.name.toLowerCase())
    }
    const injected = connectors.find((c) => c.id === 'injected')
    if (injected && out.length === 0) out.push(injected)
    return out
  }, [connectors])

  const handleConnect = (connector: (typeof connectors)[number]) => {
    connect(
      { connector },
      {
        onSuccess: () => {
          setIsOpen(false)
          toast.success(`Connected with ${connector.name}`)
        },
        onError: (err) => {
          const msg = err?.message ?? 'Connection failed'
          if (msg.toLowerCase().includes('rejected') || msg.toLowerCase().includes('user denied')) {
            toast.error('Connection rejected')
          } else if (msg.toLowerCase().includes('connector') && msg.toLowerCase().includes('not found')) {
            toast.error('Wallet extension not detected')
          } else {
            toast.error(msg.slice(0, 140))
          }
        },
      },
    )
  }

  const handleFallback = (w: (typeof POPULAR_FALLBACKS)[number]) => {
    if (!w.detect()) {
      window.open(w.install, '_blank', 'noopener')
      toast.info(`Install ${w.label} extension to continue`)
      return
    }
    const match = orderedConnectors.find((c) => c.name.toLowerCase().includes(w.key))
    if (match) {
      handleConnect(match)
      return
    }
    const injected = connectors.find((c) => c.id === 'injected')
    if (injected) handleConnect(injected)
  }

  if (isWrongChain) {
    return (
      <Button
        variant="destructive"
        onClick={() => switchChain({ chainId: zenithTestnet.id })}
        disabled={isSwitching}
        className="gap-2 shadow-lg shadow-destructive/30"
      >
        {isSwitching ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertCircle className="h-4 w-4" />}
        Switch to Zenith
      </Button>
    )
  }

  if (isConnected && address) {
    const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="gap-2 bg-background/80 backdrop-blur-sm border-primary/30 hover:border-primary hover:bg-primary/5 shadow-md transition-all"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <Wallet className="h-4 w-4 text-primary" />
            <span className="font-mono text-sm">{shortAddress}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <div className="px-2 py-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">
              Connected · Zenith Testnet
            </div>
            <div className="font-mono text-xs break-all">{address}</div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={copyAddress} className="gap-2 cursor-pointer">
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy Address'}
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="gap-2 cursor-pointer">
            <a
              href={`https://explorer.zerithchain.xyz/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4" />
              View on Explorer
            </a>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => disconnect()}
            className="gap-2 cursor-pointer text-destructive focus:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/30 transition-all hover:scale-[1.02] gap-2 px-5">
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden gap-0">
        <DialogHeader className="p-6 pb-3">
          <DialogTitle className="text-xl font-bold tracking-tight">
            Connect a wallet
          </DialogTitle>
          <DialogDescription className="text-sm">
            Choose your preferred wallet to enter Zenith Testnet.
          </DialogDescription>
        </DialogHeader>

        <div className="px-4 pb-2 space-y-1.5 max-h-[55vh] overflow-y-auto">
          {orderedConnectors.map((connector) => {
            const Icon = pickIconForConnector(connector)
            const isLoading = isPending && (variables?.connector as any)?.uid === connector.uid
            const desc = descForConnector(connector)
            return (
              <button
                key={connector.uid}
                type="button"
                disabled={isPending}
                onClick={() => handleConnect(connector)}
                className="w-full group flex items-center gap-3.5 p-3 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon className="h-10 w-10 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{connector.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{desc}</div>
                </div>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : (
                  <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                    {connector.id === 'metaMask' ? 'Popular' : ''}
                  </span>
                )}
              </button>
            )
          })}

          {POPULAR_FALLBACKS.filter(
            (w) => !orderedConnectors.some((c) => c.name.toLowerCase().includes(w.key)),
          ).map((w) => {
            const Icon = w.Icon
            const installed = w.detect()
            return (
              <button
                key={w.key}
                type="button"
                onClick={() => handleFallback(w)}
                className="w-full group flex items-center gap-3.5 p-3 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-left"
              >
                <Icon className="h-10 w-10 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{w.label}</div>
                  <div className="text-xs text-muted-foreground truncate">{w.subtitle}</div>
                </div>
                <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                  {installed ? 'Connect' : 'Install'}
                </span>
              </button>
            )
          })}
        </div>

        <div className="p-4 border-t border-border/50 bg-muted/20">
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            By connecting a wallet, you agree to our{' '}
            <a href="/terms" className="text-primary hover:underline">Terms of Service</a> and{' '}
            <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
            Zenith Points (ZP) and ZTH are testnet assets with no monetary value.
            {!HAS_WALLETCONNECT && (
              <span className="block mt-1 text-amber-600 dark:text-amber-400">
                WalletConnect QR disabled — set VITE_WALLETCONNECT_PROJECT_ID to enable.
              </span>
            )}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
