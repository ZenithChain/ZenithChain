import { WagmiProvider, useAccount, useConnect, useDisconnect, useSwitchChain, useChainId } from 'wagmi'
import { config, zenithTestnet } from '@/lib/wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Copy, LogOut, Wallet, AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useConnectWallet } from '@workspace/api-client-react'
import { toast } from 'sonner'

export function ConnectWalletButton() {
  const { address, isConnected } = useAccount()
  const { connectors, connect } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const connectWalletMutation = useConnectWallet()
  
  const [isOpen, setIsOpen] = useState(false)

  // Handle wrong chain
  const isWrongChain = isConnected && chainId !== zenithTestnet.id

  useEffect(() => {
    if (isConnected && address) {
      const ref = localStorage.getItem('zenith_ref')
      connectWalletMutation.mutate({
        data: {
          address,
          referralCode: ref
        }
      }, {
        onSuccess: () => {
          // Toast or handle success silently
        },
        onError: () => {
          toast.error('Failed to register user session')
        }
      })
    }
  }, [isConnected, address])

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      toast.success('Address copied to clipboard')
    }
  }

  if (isWrongChain) {
    return (
      <Button 
        variant="destructive" 
        onClick={() => switchChain({ chainId: zenithTestnet.id })}
        className="gap-2"
      >
        <AlertCircle className="h-4 w-4" />
        Switch to Zenith
      </Button>
    )
  }

  if (isConnected && address) {
    const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2 bg-background/50 backdrop-blur-sm border-primary/20 hover:border-primary/50 transition-colors">
            <Wallet className="h-4 w-4 text-primary" />
            <span className="font-mono">{shortAddress}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Wallet Settings</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={copyAddress} className="gap-2 cursor-pointer">
            <Copy className="h-4 w-4" />
            Copy Address
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => disconnect()} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
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
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-105">
          Connect Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold tracking-tight">Connect Wallet</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          {connectors.map((connector) => (
            <Button
              key={connector.uid}
              variant="outline"
              size="lg"
              className="w-full justify-between h-14 px-6 border-primary/20 hover:border-primary hover:bg-primary/5"
              onClick={() => {
                connect({ connector })
                setIsOpen(false)
              }}
            >
              <span className="font-medium text-base">{connector.name}</span>
              <Wallet className="h-5 w-5 text-muted-foreground" />
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
