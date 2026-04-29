import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useQueryClient } from '@tanstack/react-query'
import { useMutation } from '@tanstack/react-query'
import {
  useGetFeatureFlags,
  useGetAdminCheck,
  getGetFeatureFlagsQueryKey,
  getGetAdminCheckQueryKey,
} from '@workspace/api-client-react'
import { Layout } from '@/components/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import {
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Wallet,
  CheckCircle2,
  XCircle,
  Lock,
} from 'lucide-react'
import { toast } from 'sonner'
import { ConnectWalletButton } from '@/components/ConnectWalletButton'

const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? ''

async function setFlag(args: {
  key: string
  enabled: boolean
  adminAddress: string
}) {
  const res = await fetch(`${API_BASE}/api/admin/feature-flags`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-address': args.adminAddress,
    },
    body: JSON.stringify({ key: args.key, enabled: args.enabled }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Request failed (${res.status})`)
  }
  return res.json()
}

export default function Admin() {
  const { address, isConnected } = useAccount()
  const queryClient = useQueryClient()
  const [pending, setPending] = useState<string | null>(null)

  const { data: adminCheck, isLoading: isCheckingAdmin } = useGetAdminCheck(
    { address: address ?? '' },
    {
      query: {
        queryKey: getGetAdminCheckQueryKey({ address: address ?? '' }),
        enabled: !!address,
      },
    },
  )

  const isAdmin = adminCheck?.isAdmin === true
  const adminConfigured = adminCheck?.configured === true

  const { data: flagsData, isLoading: isLoadingFlags } = useGetFeatureFlags({
    query: {
      queryKey: getGetFeatureFlagsQueryKey(),
      enabled: isAdmin,
    },
  })

  const mutation = useMutation({
    mutationFn: setFlag,
    onSuccess: (_data, variables) => {
      toast.success(
        `${variables.key} ${variables.enabled ? 'opened' : 'closed'} successfully`,
      )
      queryClient.invalidateQueries({
        queryKey: getGetFeatureFlagsQueryKey(),
      })
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Failed to update flag')
    },
    onSettled: () => setPending(null),
  })

  const handleToggle = (key: string, enabled: boolean) => {
    if (!address) return
    setPending(key)
    mutation.mutate({ key, enabled, adminAddress: address })
  }

  return (
    <Layout>
      <div className="container px-4 md:px-6 py-10 max-w-3xl">
        <div className="mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold uppercase tracking-wider text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            Admin Panel
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Page Visibility Controls
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl">
            Toggle individual pages on or off. Disabled pages will display a "Soon"
            placeholder to all visitors. Changes take effect instantly.
          </p>
        </div>

        {!isConnected ? (
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="pt-6 pb-6 text-center space-y-4">
              <Wallet className="h-10 w-10 mx-auto text-amber-500" />
              <div>
                <CardTitle className="text-lg">Connect a wallet</CardTitle>
                <CardDescription className="mt-1">
                  Connect your admin wallet to access this panel.
                </CardDescription>
              </div>
              <div className="pt-2 flex justify-center">
                <ConnectWalletButton />
              </div>
            </CardContent>
          </Card>
        ) : isCheckingAdmin ? (
          <Card>
            <CardContent className="py-10 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </CardContent>
          </Card>
        ) : !adminConfigured ? (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="pt-6 pb-6 text-center space-y-3">
              <ShieldAlert className="h-10 w-10 mx-auto text-destructive" />
              <CardTitle className="text-lg">Admin not configured</CardTitle>
              <CardDescription className="max-w-md mx-auto">
                The server has no <code className="px-1 py-0.5 rounded bg-muted text-xs">ADMIN_WALLETS</code>{' '}
                environment variable set. Add a comma-separated list of admin wallet addresses to your API
                server environment to enable this panel.
              </CardDescription>
            </CardContent>
          </Card>
        ) : !isAdmin ? (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="pt-6 pb-6 text-center space-y-3">
              <Lock className="h-10 w-10 mx-auto text-destructive" />
              <CardTitle className="text-lg">Access denied</CardTitle>
              <CardDescription className="max-w-md mx-auto">
                The connected wallet (<span className="font-mono text-xs">{address?.slice(0, 6)}…{address?.slice(-4)}</span>)
                is not authorized. Connect with an admin wallet to manage page visibility.
              </CardDescription>
            </CardContent>
          </Card>
        ) : isLoadingFlags ? (
          <Card>
            <CardContent className="py-10 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {flagsData?.flags.map((flag) => {
              const isPending = pending === flag.key
              return (
                <Card
                  key={flag.key}
                  className={`transition-colors ${
                    flag.enabled
                      ? 'border-emerald-500/20 bg-emerald-500/[0.02]'
                      : 'border-muted bg-muted/20 opacity-90'
                  }`}
                >
                  <CardContent className="py-4 px-5 flex items-center gap-4">
                    <div className="flex-shrink-0">
                      {flag.enabled ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm">{flag.label}</h3>
                        <span
                          className={`text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${
                            flag.enabled
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {flag.enabled ? 'Open' : 'Soon'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {flag.description}
                      </p>
                      {flag.updatedAt && flag.updatedBy && (
                        <p className="text-[10px] text-muted-foreground/70 mt-1 font-mono">
                          updated {new Date(flag.updatedAt).toLocaleString()} by{' '}
                          {flag.updatedBy.slice(0, 6)}…{flag.updatedBy.slice(-4)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isPending && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                      <Switch
                        checked={flag.enabled}
                        disabled={isPending}
                        onCheckedChange={(checked) => handleToggle(flag.key, checked)}
                        aria-label={`Toggle ${flag.label}`}
                      />
                    </div>
                  </CardContent>
                </Card>
              )
            })}

            <div className="pt-4 text-xs text-muted-foreground">
              <p>
                Tip: changes are stored server-side and apply to all visitors immediately. The
                page in question will display a "Soon" placeholder when closed.
              </p>
            </div>

            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  queryClient.invalidateQueries({ queryKey: getGetFeatureFlagsQueryKey() })
                }
              >
                Refresh
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
