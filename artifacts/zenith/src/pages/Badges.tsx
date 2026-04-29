import { Layout } from '@/components/Layout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAccount, useChainId, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import {
  Award,
  Loader2,
  CheckCircle2,
  Flame,
  ExternalLink,
  Lock,
  AlertCircle,
  Users,
  Sparkles,
} from 'lucide-react'
import badgePioneer from '@/assets/badge-pioneer.png'
import badgeGenesis from '@/assets/badge-genesis.png'
import { buildMintTx, isContractDeployed, type BadgeType } from '@/lib/badgeContract'
import { zenithTestnet } from '@/lib/wagmi'

interface BadgeStateView {
  cap: number
  claimed: number
  remaining: number
  rewardZp: number
  referralRequirement?: number
}
interface UserBadgeState {
  claimed: boolean
  eligible: boolean
  unmetReason: string | null
  claim: { txHash: string | null; position: number; claimedAt: string } | null
}
interface EligibilityResponse {
  pioneer: BadgeStateView
  genesis: BadgeStateView
  user?: {
    connected: boolean
    referrals: number
    pioneer: UserBadgeState
    genesis: UserBadgeState
  }
}

const BASE = ((import.meta as any).env?.BASE_URL ?? '/').toString()
const API_BASE = ((import.meta as any).env?.VITE_API_URL ?? '').toString().replace(/\/+$/, '')
const apiUrl = (path: string) => {
  const suffix = `api${path.startsWith('/') ? path : `/${path}`}`
  return API_BASE ? `${API_BASE}/${suffix}` : `${BASE}${suffix}`
}

export default function Badges() {
  const { address } = useAccount()
  const chainId = useChainId()
  const [data, setData] = useState<EligibilityResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEligibility = async () => {
    setLoading(true)
    try {
      const url = apiUrl(`/badges/eligibility${address ? `?address=${address}` : ''}`)
      const r = await fetch(url)
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const j = await r.json()
      setData(j)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load badges')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchEligibility()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address])

  return (
    <Layout>
      <ProtectedRoute>
        <div className="container max-w-5xl py-8 px-4 md:px-6">
          <header className="mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
              Onchain Badges
            </p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Mint your Zenith badge
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Soulbound NFTs minted to your wallet on Zenith Testnet (chain {zenithTestnet.id}).
              Mint costs gas in ZTH — claim from the faucet first if your wallet is empty.
            </p>
          </header>

          {error && (
            <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive p-4 text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {loading && !data ? (
            <div className="flex justify-center p-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : data ? (
            <div className="grid md:grid-cols-2 gap-6">
              <BadgeMintCard
                badgeType="pioneer"
                title="Zenith Pioneer"
                tagline="Refer 10 friends. Become network gravity."
                badgeImg={badgePioneer}
                accent="amber"
                supply={data.pioneer}
                user={data.user?.pioneer}
                userReferrals={data.user?.referrals ?? 0}
                connected={!!data.user?.connected}
                chainId={chainId}
                refresh={fetchEligibility}
              />
              <BadgeMintCard
                badgeType="genesis"
                title="Zenith Genesis"
                tagline="One of the first 10,000. Proof of presence at zenith."
                badgeImg={badgeGenesis}
                accent="slate"
                supply={data.genesis}
                user={data.user?.genesis}
                userReferrals={data.user?.referrals ?? 0}
                connected={!!data.user?.connected}
                chainId={chainId}
                refresh={fetchEligibility}
              />
            </div>
          ) : null}

          <section className="mt-12 rounded-2xl bg-muted/40 border border-border p-6 text-sm leading-relaxed">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              How minting works
            </h3>
            <ol className="space-y-2 text-muted-foreground list-decimal pl-5">
              <li>Click "Mint Badge". Your wallet will prompt to send a transaction on Zenith Testnet (chain {zenithTestnet.id}).</li>
              <li>The transaction is broadcast to the Zenith RPC. Mint costs only gas — no payment required.</li>
              <li>Once the transaction is confirmed onchain, the campaign records your badge slot and awards bonus ZP.</li>
              <li>Soulbound: badges cannot be transferred or sold. They live in your wallet permanently.</li>
            </ol>
          </section>
        </div>
      </ProtectedRoute>
    </Layout>
  )
}

interface BadgeMintCardProps {
  badgeType: BadgeType
  title: string
  tagline: string
  badgeImg: string
  accent: 'amber' | 'slate'
  supply: BadgeStateView
  user?: UserBadgeState
  userReferrals: number
  connected: boolean
  chainId: number
  refresh: () => void | Promise<void>
}

function BadgeMintCard({
  badgeType,
  title,
  tagline,
  badgeImg,
  accent,
  supply,
  user,
  userReferrals,
  connected,
  chainId,
  refresh,
}: BadgeMintCardProps) {
  const { address } = useAccount()
  const { sendTransactionAsync, isPending: isSending } = useSendTransaction()
  const [pendingHash, setPendingHash] = useState<`0x${string}` | undefined>()
  const [submitting, setSubmitting] = useState(false)

  const { isLoading: isWaitingReceipt, isSuccess: receiptOk, isError: receiptErr } =
    useWaitForTransactionReceipt({
      hash: pendingHash,
      chainId: zenithTestnet.id,
      query: { enabled: !!pendingHash },
    })

  const isWrongChain = connected && chainId !== zenithTestnet.id
  const claimed = !!user?.claimed
  const eligible = !!user?.eligible
  const reason = user?.unmetReason
  const pct = Math.min(100, (supply.claimed / supply.cap) * 100)

  const accentClasses =
    accent === 'amber'
      ? {
          ring: 'border-amber-900/50 hover:border-amber-600/70 hover:shadow-amber-900/20',
          panel: 'from-amber-950/60 via-zinc-950 to-zinc-950',
          glow: 'bg-amber-500/10',
          text: 'text-amber-100',
          subtext: 'text-amber-100/60',
          chip: 'bg-amber-500/20 text-amber-300',
          progress: 'bg-amber-500',
          dropShadow: 'drop-shadow-[0_20px_40px_rgba(245,158,11,0.3)]',
        }
      : {
          ring: 'border-slate-700/50 hover:border-slate-400/70 hover:shadow-slate-700/20',
          panel: 'from-slate-800/60 via-zinc-950 to-zinc-950',
          glow: 'bg-slate-400/10',
          text: 'text-slate-100',
          subtext: 'text-slate-300/60',
          chip: 'bg-slate-400/20 text-slate-200',
          progress: 'bg-slate-300',
          dropShadow: 'drop-shadow-[0_20px_40px_rgba(148,163,184,0.3)]',
        }

  const handleMint = async () => {
    if (!address) return
    if (isWrongChain) {
      toast.error('Wrong network — switch to Zenith Testnet first.')
      return
    }
    setSubmitting(true)
    try {
      const tx = buildMintTx(badgeType, address)
      const hash = await sendTransactionAsync({
        to: tx.to,
        data: tx.data,
        value: tx.value,
        chainId: zenithTestnet.id,
      })
      setPendingHash(hash)
      toast.success('Mint tx submitted', { description: hash.slice(0, 10) + '…' })
    } catch (e: any) {
      const msg = e?.shortMessage ?? e?.message ?? 'Mint failed'
      if (msg.toLowerCase().includes('rejected') || msg.toLowerCase().includes('user denied')) {
        toast.error('Transaction rejected')
      } else if (msg.toLowerCase().includes('connector') || msg.toLowerCase().includes('rpc') || msg.toLowerCase().includes('network')) {
        toast.error('Could not reach Zenith RPC', {
          description: 'The Zenith Testnet RPC must be online. Try again once the network is responsive.',
        })
      } else {
        toast.error(msg.slice(0, 140))
      }
      setSubmitting(false)
    }
  }

  // After receipt confirms, post-claim to backend.
  useEffect(() => {
    const post = async () => {
      if (!receiptOk || !pendingHash || !address) return
      try {
        const r = await fetch(apiUrl('/badges/claim'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address,
            badgeType,
            txHash: pendingHash,
            chainId: zenithTestnet.id,
          }),
        })
        const j = await r.json()
        if (!r.ok) throw new Error(j?.message ?? 'Claim failed')
        toast.success(`Badge minted! +${j.zpAwarded} ZP · #${j.position}`)
        await refresh()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Claim failed')
      } finally {
        setSubmitting(false)
        setPendingHash(undefined)
      }
    }
    void post()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receiptOk])

  useEffect(() => {
    if (receiptErr) {
      toast.error('Transaction reverted onchain')
      setSubmitting(false)
      setPendingHash(undefined)
    }
  }, [receiptErr])

  const renderButton = () => {
    if (claimed && user?.claim) {
      return (
        <div className="space-y-2">
          <Button
            disabled
            variant="outline"
            className="w-full gap-2 border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
          >
            <CheckCircle2 className="h-4 w-4" />
            Minted · #{user.claim.position}
          </Button>
          {user.claim.txHash && (
            <a
              href={`https://explorer.zerithchain.xyz/tx/${user.claim.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 justify-center"
            >
              View transaction
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      )
    }

    if (!connected) {
      return (
        <Button disabled className="w-full gap-2">
          <Lock className="h-4 w-4" />
          Connect wallet first
        </Button>
      )
    }

    if (isWrongChain) {
      return (
        <Button variant="destructive" className="w-full gap-2" disabled>
          <AlertCircle className="h-4 w-4" />
          Switch to Zenith Testnet
        </Button>
      )
    }

    if (!eligible && reason) {
      return (
        <Button disabled variant="outline" className="w-full gap-2">
          <Lock className="h-4 w-4" />
          {reason}
        </Button>
      )
    }

    const busy = submitting || isSending || isWaitingReceipt
    return (
      <Button
        onClick={handleMint}
        disabled={busy || supply.remaining === 0}
        className="w-full gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30"
      >
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {isWaitingReceipt ? 'Waiting confirmation…' : 'Sign in wallet…'}
          </>
        ) : (
          <>
            <Flame className="h-4 w-4" />
            Mint Badge · costs gas
          </>
        )}
      </Button>
    )
  }

  return (
    <Card
      className={`relative overflow-hidden bg-gradient-to-br ${accentClasses.panel} border ${accentClasses.ring} transition-all hover:shadow-2xl`}
    >
      <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full ${accentClasses.glow} blur-3xl pointer-events-none`} />
      <div className="relative p-6 md:p-8 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className={`text-2xl font-bold ${accentClasses.text}`}>{title}</h3>
            <p className={`text-sm mt-1 ${accentClasses.subtext}`}>{tagline}</p>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${accentClasses.chip}`}>
            {supply.cap.toLocaleString()} max
          </span>
        </div>

        <div className="flex justify-center py-2">
          <img
            src={badgeImg}
            alt={title}
            className={`h-44 md:h-52 w-auto object-contain ${accentClasses.dropShadow}`}
          />
        </div>

        {/* Supply progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className={accentClasses.subtext}>
              {supply.claimed.toLocaleString()} / {supply.cap.toLocaleString()} minted
            </span>
            <span className={`font-mono ${accentClasses.text}`}>{pct.toFixed(1)}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className={`h-full ${accentClasses.progress} transition-all`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Pioneer-only referral progress */}
        {badgeType === 'pioneer' && supply.referralRequirement && (
          <div className="rounded-lg bg-black/30 border border-white/5 p-3 flex items-center gap-3">
            <Users className="h-5 w-5 text-amber-400 flex-shrink-0" />
            <div className="text-xs flex-1">
              <div className={accentClasses.text}>Referrals</div>
              <div className={accentClasses.subtext}>
                {userReferrals} / {supply.referralRequirement} required
              </div>
            </div>
            <div className={`text-xs font-mono ${accentClasses.text}`}>
              {Math.min(100, (userReferrals / supply.referralRequirement) * 100).toFixed(0)}%
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-white/60">
          <div className="flex items-center gap-1.5">
            <Award className="h-3.5 w-3.5" />
            +{supply.rewardZp.toLocaleString()} ZP bonus
          </div>
          <div>Soulbound · non-transferable</div>
        </div>

        {!isContractDeployed(badgeType) && (
          <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3 text-[11px] text-amber-200 leading-relaxed">
            <strong className="block mb-1">Contract address pending</strong>
            Set <code className="font-mono">VITE_BADGE_{badgeType.toUpperCase()}_CONTRACT</code> after deploying
            <code className="font-mono"> contracts/ZenithBadge.sol</code>. Until then minting still
            broadcasts a real on-chain handshake transaction (gas only).
          </div>
        )}

        {renderButton()}
      </div>
    </Card>
  )
}
