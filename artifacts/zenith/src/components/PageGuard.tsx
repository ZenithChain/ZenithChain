import { ReactNode } from 'react'
import { useGetFeatureFlags, getGetFeatureFlagsQueryKey } from '@workspace/api-client-react'
import { Layout } from './Layout'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Sparkles, ArrowLeft } from 'lucide-react'
import { Link } from 'wouter'
import { Button } from '@/components/ui/button'

interface PageGuardProps {
  pageKey: string
  pageLabel?: string
  children: ReactNode
}

export function PageGuard({ pageKey, pageLabel, children }: PageGuardProps) {
  const { data, isLoading, isError } = useGetFeatureFlags({
    query: {
      queryKey: getGetFeatureFlagsQueryKey(),
      staleTime: 30_000,
      retry: 1,
    },
  })

  if (isLoading) {
    return (
      <Layout>
        <div className="container px-4 md:px-6 py-16 flex items-center justify-center min-h-[40vh]">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </Layout>
    )
  }

  if (isError || !data) {
    return <>{children}</>
  }

  const flag = data.flags.find((f) => f.key === pageKey)
  const enabled = flag ? flag.enabled : true

  if (enabled) return <>{children}</>

  const label = pageLabel ?? flag?.label ?? pageKey

  return (
    <Layout>
      <div className="container px-4 md:px-6 py-16 lg:py-24 flex items-center justify-center">
        <Card className="max-w-lg w-full border-primary/20 bg-card/40 backdrop-blur-sm shadow-xl shadow-primary/5">
          <CardContent className="pt-10 pb-10 text-center space-y-6">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <div className="text-xs uppercase tracking-[0.2em] text-primary/80 font-semibold">
                {label}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Soon</h1>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                This section of the Zenith Testnet is temporarily closed. Check back shortly —
                we'll let you know on socials when it's live.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
              <Link href="/dashboard">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
