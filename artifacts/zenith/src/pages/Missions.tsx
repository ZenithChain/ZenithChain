import { Layout } from '@/components/Layout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAccount } from 'wagmi'
import {
  useListMissions,
  useCompleteMission,
  getListMissionsQueryKey,
  getGetUserQueryKey,
  getGetGlobalStatsQueryKey,
} from '@workspace/api-client-react'
import { useQueryClient } from '@tanstack/react-query'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Zap,
  Twitter,
  MessageCircle,
  Send as SendIcon,
  Target as TargetIcon,
  ArrowRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { useState } from 'react'
import {
  verifyMissionOnchain,
  ONCHAIN_MISSION_SLUGS,
  SOCIAL_MISSION_SLUGS,
} from '@/lib/onchainVerifier'
import { SocialConnectDialog } from '@/components/SocialConnectDialog'

function iconForSocial(slug: string) {
  if (slug === 'follow-x') return Twitter
  if (slug === 'join-discord') return MessageCircle
  if (slug === 'join-telegram') return SendIcon
  return TargetIcon
}

export default function Missions() {
  const { address } = useAccount()
  const queryClient = useQueryClient()

  const { data: missions, isLoading } = useListMissions(
    { address },
    { query: { enabled: !!address } },
  )

  const completeMission = useCompleteMission({
    mutation: {
      onSuccess: (data) => {
        toast.success(`Mission complete · +${data.zpAwarded} ZP`)
        queryClient.invalidateQueries({ queryKey: getListMissionsQueryKey({ address }) })
        if (address) {
          queryClient.invalidateQueries({ queryKey: getGetUserQueryKey(address) })
        }
        queryClient.invalidateQueries({ queryKey: getGetGlobalStatsQueryKey() })
      },
      onError: (err: any) => {
        const msg = err?.payload?.message ?? err?.message ?? 'Failed to complete mission'
        toast.error(msg)
      },
    },
  })

  const [verifyingSlug, setVerifyingSlug] = useState<string | null>(null)
  const [socialDialog, setSocialDialog] = useState<
    | { open: true; slug: string; name: string; actionUrl: string | null }
    | { open: false }
  >({ open: false })

  const onchainVerify = async (slug: string) => {
    if (!address) return
    setVerifyingSlug(slug)
    toast.message('Reading Zenith chain…', {
      description: 'Checking your wallet activity onchain.',
    })
    try {
      const result = await verifyMissionOnchain(slug, address)
      if (!result.ok) {
        if (result.rpcUnreachable) {
          toast.error('Zenith RPC unreachable', {
            description:
              'The verifier could not reach the Zenith RPC right now. Try again in a moment.',
          })
        } else {
          toast.error('Verification failed', { description: result.reason })
        }
        return
      }
      toast.success('Onchain check passed', { description: result.details })
      completeMission.mutate({ data: { address, missionSlug: slug } })
    } finally {
      setVerifyingSlug(null)
    }
  }

  const openSocial = (slug: string, name: string, actionUrl: string | null) => {
    setSocialDialog({ open: true, slug, name, actionUrl })
  }

  const submitSocial = async (handle: string) => {
    if (!address || !socialDialog.open) return
    try {
      localStorage.setItem(`zenith_social_${socialDialog.slug}`, handle)
    } catch {}
    await new Promise<void>((resolve, reject) => {
      completeMission.mutate(
        { data: { address, missionSlug: socialDialog.slug } },
        { onSuccess: () => resolve(), onError: (e) => reject(e) },
      )
    })
  }

  const handleBasic = (slug: string) => {
    if (!address) return
    completeMission.mutate({ data: { address, missionSlug: slug } })
  }

  const basicMissions = missions?.filter((m) => m.type === 'basic') || []
  const advancedMissions = missions?.filter((m) => m.type === 'advanced') || []
  const socialMissions = missions?.filter((m) => m.type === 'social') || []

  const renderActionButton = (mission: NonNullable<typeof missions>[number]) => {
    const isOnchain = ONCHAIN_MISSION_SLUGS.has(mission.slug)
    const isSocial = SOCIAL_MISSION_SLUGS.has(mission.slug)

    if (mission.completed) {
      return (
        <Button disabled variant="outline" className="w-full sm:w-auto gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          Completed
        </Button>
      )
    }

    if (isOnchain) {
      const isThisVerifying = verifyingSlug === mission.slug
      return (
        <Button
          onClick={() => onchainVerify(mission.slug)}
          disabled={isThisVerifying || completeMission.isPending}
          className="w-full sm:w-auto gap-2"
        >
          {isThisVerifying ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ShieldCheck className="h-4 w-4" />
          )}
          {isThisVerifying ? 'Verifying…' : mission.actionLabel || 'Verify onchain'}
        </Button>
      )
    }

    if (isSocial) {
      const SocialIcon = iconForSocial(mission.slug)
      return (
        <Button
          onClick={() => openSocial(mission.slug, mission.name, mission.actionUrl ?? null)}
          disabled={completeMission.isPending}
          className="w-full sm:w-auto gap-2"
        >
          <SocialIcon className="h-4 w-4" />
          Connect & Verify
        </Button>
      )
    }

    return (
      <Button
        onClick={() => handleBasic(mission.slug)}
        disabled={completeMission.isPending}
        className="w-full sm:w-auto gap-2"
      >
        <Zap className="h-4 w-4" />
        {mission.actionLabel || 'Complete'}
      </Button>
    )
  }

  const MissionList = ({ list }: { list: typeof missions }) => {
    if (isLoading) {
      return (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )
    }
    if (!list?.length) {
      return <div className="text-center p-12 text-muted-foreground">No missions yet.</div>
    }

    return (
      <div className="grid gap-3 mt-6">
        {list.map((mission) => {
          const isOnchain = ONCHAIN_MISSION_SLUGS.has(mission.slug)
          const isSocial = SOCIAL_MISSION_SLUGS.has(mission.slug)
          return (
            <Card
              key={mission.id}
              className={`transition-all border ${
                mission.completed
                  ? 'opacity-70 bg-muted/20'
                  : 'hover:border-primary/40 hover:shadow-md'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div
                    className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      mission.completed
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {mission.completed ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : isOnchain ? (
                      <ShieldCheck className="h-5 w-5" />
                    ) : isSocial ? (
                      (() => {
                        const Icon = iconForSocial(mission.slug)
                        return <Icon className="h-5 w-5" />
                      })()
                    ) : (
                      <Zap className="h-5 w-5" />
                    )}
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-base truncate">{mission.name}</h3>
                      {isOnchain && !mission.completed && (
                        <Badge variant="outline" className="text-[10px] gap-1 px-1.5 py-0 border-primary/30 text-primary">
                          <ShieldCheck className="h-2.5 w-2.5" />
                          Auto-verify
                        </Badge>
                      )}
                      {isSocial && !mission.completed && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          Social
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{mission.description}</p>
                    {mission.completed && mission.completedAt && (
                      <p className="text-xs text-muted-foreground/70">
                        Completed {format(new Date(mission.completedAt), 'MMM d, yyyy')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:flex-col sm:items-end shrink-0 w-full sm:w-auto">
                  <div className="font-bold text-primary text-sm whitespace-nowrap">
                    +{mission.reward} ZP
                  </div>
                  {renderActionButton(mission)}
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    )
  }

  return (
    <Layout>
      <ProtectedRoute>
        <div className="container max-w-5xl py-8 px-4 md:px-6">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
              Genesis Missions
            </p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Earn your tier</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Onchain missions auto-verify by reading your wallet activity directly
              from the Zenith RPC. Social missions verify after you connect your account.
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary">
                <ShieldCheck className="h-3.5 w-3.5" />
                On-chain reads via RPC
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-muted-foreground">
                <ArrowRight className="h-3.5 w-3.5" />
                No manual review for onchain tasks
              </div>
            </div>
          </div>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="basic">Basic ({basicMissions.length})</TabsTrigger>
              <TabsTrigger value="advanced">Onchain ({advancedMissions.length})</TabsTrigger>
              <TabsTrigger value="social">Social ({socialMissions.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="basic">
              <MissionList list={basicMissions} />
            </TabsContent>
            <TabsContent value="advanced">
              <MissionList list={advancedMissions} />
            </TabsContent>
            <TabsContent value="social">
              <MissionList list={socialMissions} />
            </TabsContent>
          </Tabs>
        </div>

        <SocialConnectDialog
          open={socialDialog.open}
          onOpenChange={(o) => !o && setSocialDialog({ open: false })}
          missionSlug={socialDialog.open ? socialDialog.slug : ''}
          missionName={socialDialog.open ? socialDialog.name : ''}
          actionUrl={socialDialog.open ? socialDialog.actionUrl : null}
          onVerified={submitSocial}
          isSubmitting={completeMission.isPending}
        />
      </ProtectedRoute>
    </Layout>
  )
}
