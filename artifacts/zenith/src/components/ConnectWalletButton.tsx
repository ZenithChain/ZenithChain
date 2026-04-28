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
import { Copy, LogOut, Wallet, AlertCircle, Loader2, ExternalLink } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import { useConnectWallet } from '@workspace/api-client-react'
import { toast } from 'sonner'

const WALLET_META: Record<
  string,
  { label: string; subtitle: string; gradient: string; install?: string }
> = {
  metaMask: {
    label: 'MetaMask',
    subtitle: 'Most popular browser wallet',
    gradient: 'from-orange-500 to-amber-600',
    install: 'https://metamask.io/download/',
  },
  walletConnect: {
    label: 'WalletConnect',
    subtitle: 'Scan QR with mobile wallet',
    gradient: 'from-blue-500 to-indigo-600',
  },
  coinbaseWalletSDK: {
    label: 'Coinbase Wallet',
    subtitle: 'Connect with Coinbase',
    gradient: 'from-blue-600 to-blue-800',
  },
  injected: {
    label: 'Browser Wallet',
    subtitle: 'OKX, Trust, Brave, etc.',
    gradient: 'from-primary to-primary/60',
  },
}

const POPULAR_WALLETS = [
  {
    key: 'okx',
    label: 'OKX Wallet',
    subtitle: 'Use OKX browser extension',
    gradient: 'from-zinc-900 to-zinc-700',
    detect: () =>
      typeof window !== 'undefined' &&
      ((window as any).okxwallet || (window as any).ethereum?.isOkxWallet),
    install: 'https://www.okx.com/web3',
  },
  {
    key: 'trust',
    label: 'Trust Wallet',
    subtitle: 'Use Trust browser extension',
    gradient: 'from-blue-500 to-cyan-500',
    detect: () =>
      typeof window !== 'undefined' &&
      ((window as any).trustwallet || (window as any).ethereum?.isTrust),
    install: 'https://trustwallet.com/browser-extension',
  },
]

function metaForConnector(c: { id: string; name: string; type: string }) {
  if (WALLET_META[c.id]) return { ...WALLET_META[c.id], label: WALLET_META[c.id].label }
  // EIP-6963 discovered wallets — use connector name + try to match popular ones
  const lower = c.name.toLowerCase()
  if (lower.includes('okx'))
    return {
      label: c.name,
      subtitle: 'Use OKX browser extension',
      gradient: 'from-zinc-900 to-zinc-700',
    }
  if (lower.includes('trust'))
    return {
      label: c.name,
      subtitle: 'Use Trust Wallet extension',
      gradient: 'from-blue-500 to-cyan-500',
    }
  if (lower.includes('rabby'))
    return {
      label: c.name,
      subtitle: 'Use Rabby Wallet',
      gradient: 'from-blue-400 to-purple-500',
    }
  if (lower.includes('phantom'))
    return {
      label: c.name,
      subtitle: 'Use Phantom Wallet',
      gradient: 'from-purple-500 to-pink-500',
    }
  return {
    label: c.name,
    subtitle: 'Browser wallet extension',
    gradient: 'from-primary to-primary/60',
  }
}

function WalletIcon({ gradient, label }: { gradient: string; label: string }) {
  return (
    <div
      className={`h-10 w-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-base shadow-md flex-shrink-0`}
    >
      {label.charAt(0)}
    </div>
  )
}

export function ConnectWalletButton() {
  const { address, isConnected } = useAccount()
  const { connectors, connect, isPending, variables } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { switchChain, isPending: isSwitching } = useSwitchChain()
  const connectWalletMutation = useConnectWallet()

  const [isOpen, setIsOpen] = useState(false)

  const isWrongChain = isConnected && chainId !== zenithTestnet.id

  useEffect(() => {
    if (isConnected && address) {
      const ref = localStorage.getItem('zenith_ref')
      connectWalletMutation.mutate(
        {
          data: {
            address,
            referralCode: ref,
          },
        },
        {
          onError: () => {
            // silent — backend session is best-effort
          },
        },
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address])

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      toast.success('Address copied')
    }
  }

  // Deduplicate / order connectors: explicit ones first, then EIP-6963 discovered ones
  const orderedConnectors = useMemo(() => {
    const priority = ['metaMask', 'walletConnect', 'coinbaseWalletSDK']
    const seenNames = new Set<string>()
    const out: typeof connectors = []
    for (const id of priority) {
      const c = connectors.find((x) => x.id === id)
      if (c) {
        out.push(c)
        seenNames.add(c.name.toLowerCase())
      }
    }
    // EIP-6963 discovered (these typically have type === 'injected' but unique uid)
    for (const c of connectors) {
      if (priority.includes(c.id)) continue
      if (c.id === 'injected') continue // skip generic injected if we have specifics
      if (seenNames.has(c.name.toLowerCase())) continue
      out.push(c)
      seenNames.add(c.name.toLowerCase())
    }
    // Fallback generic injected at the end if nothing else
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
          if (msg.toLowerCase().includes('rejected')) {
            toast.error('Connection rejected')
          } else {
            toast.error(msg.slice(0, 120))
          }
        },
      },
    )
  }

  const handlePopularClick = (w: (typeof POPULAR_WALLETS)[number]) => {
    if (!w.detect()) {
      window.open(w.install, '_blank', 'noopener')
      toast.info(`Install ${w.label} extension first`)
      return
    }
    // Try to find an EIP-6963 discovered connector matching the wallet name
    const match = orderedConnectors.find((c) =>
      c.name.toLowerCase().includes(w.key),
    )
    if (match) {
      handleConnect(match)
      return
    }
    // Fallback: use generic injected
    const injected = connectors.find((c) => c.id === 'injected')
    if (injected) handleConnect(injected)
  }

  if (isWrongChain) {
    return (
      <Button
        variant="destructive"
        onClick={() => switchChain({ chainId: zenithTestnet.id })}
        disabled={isSwitching}
        className="gap-2"
      >
        {isSwitching ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <AlertCircle className="h-4 w-4" />
        )}
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
            className="gap-2 bg-background/50 backdrop-blur-sm border-primary/20 hover:border-primary/50 transition-colors"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <Wallet className="h-4 w-4 text-primary" />
            <span className="font-mono text-sm">{shortAddress}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
            Connected to Zenith Testnet
          </DropdownMenuLabel>
          <DropdownMenuLabel className="font-mono text-xs break-all pt-0">
            {address}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={copyAddress} className="gap-2 cursor-pointer">
            <Copy className="h-4 w-4" />
            Copy Address
          </DropdownMenuItem>
          <DropdownMenuItem
            asChild
            className="gap-2 cursor-pointer"
          >
            <a
              href={`https://explorer.zenithchain.xyz/address/${address}`}
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
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/30 transition-all hover:scale-[1.02] gap-2">
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2 text-center">
          <DialogTitle className="text-2xl font-bold tracking-tight">
            Connect a Wallet
          </DialogTitle>
          <DialogDescription>
            Choose your preferred wallet to enter the Zenith Testnet.
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 pb-6 pt-2 space-y-2 max-h-[60vh] overflow-y-auto">
          {orderedConnectors.map((connector) => {
            const meta = metaForConnector(connector)
            const isLoading =
              isPending && (variables?.connector as any)?.uid === connector.uid
            return (
              <button
                key={connector.uid}
                type="button"
                disabled={isPending}
                onClick={() => handleConnect(connector)}
                className="w-full group flex items-center gap-4 p-3.5 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <WalletIcon gradient={meta.gradient} label={meta.label} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{meta.label}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {meta.subtitle}
                  </div>
                </div>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : (
                  <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                    Connect
                  </span>
                )}
              </button>
            )
          })}

          {/* Popular wallets that may not be auto-detected */}
          {POPULAR_WALLETS.filter(
            (w) =>
              !orderedConnectors.some((c) =>
                c.name.toLowerCase().includes(w.key),
              ),
          ).map((w) => (
            <button
              key={w.key}
              type="button"
              onClick={() => handlePopularClick(w)}
              className="w-full group flex items-center gap-4 p-3.5 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-left"
            >
              <WalletIcon gradient={w.gradient} label={w.label} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">{w.label}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {w.subtitle}
                </div>
              </div>
              <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                {w.detect() ? 'Connect' : 'Install'}
              </span>
            </button>
          ))}
        </div>
        <div className="px-6 pb-6 pt-0 border-t border-border/50 bg-muted/20">
          <p className="text-[11px] leading-relaxed text-muted-foreground pt-3">
            By connecting, you agree this is a testnet. Zenith Points (ZP) and
            ZTH have no real-world value.
            {!HAS_WALLETCONNECT && (
              <>
                {' '}
                <span className="text-amber-600 dark:text-amber-400">
                  WalletConnect QR is disabled — set
                  <code className="mx-1 px-1 py-0.5 rounded bg-muted text-[10px]">
                    VITE_WALLETCONNECT_PROJECT_ID
                  </code>
                  to enable mobile wallets.
                </span>
              </>
            )}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
