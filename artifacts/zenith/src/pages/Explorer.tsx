import { Layout } from '@/components/Layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExternalLink, Search, Box, ArrowRightLeft, Zap } from 'lucide-react'
import { useEffect } from 'react'

const EXPLORER_URL = 'https://explorer.zenithchain.xyz'

export default function Explorer() {
  useEffect(() => {
    const t = setTimeout(() => {
      window.location.href = EXPLORER_URL
    }, 2500)
    return () => clearTimeout(t)
  }, [])

  return (
    <Layout>
      <div className="container max-w-3xl py-16 px-4 md:px-6">
        <Card className="glass-card p-8 md:p-12 text-center border-primary/20">
          <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-primary/10 text-primary mb-6">
            <Search className="h-10 w-10" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Zenith Block Explorer
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            The Zenith Explorer runs on its own subdomain (Blockscout-style) so it can
            stream blocks, transactions, contracts, and tokens in real time.
            Redirecting in a moment…
          </p>

          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mb-8">
            <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
              <Box className="h-5 w-5 mx-auto mb-1.5 text-primary" />
              <div className="text-[11px] text-muted-foreground">Blocks</div>
            </div>
            <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
              <ArrowRightLeft className="h-5 w-5 mx-auto mb-1.5 text-primary" />
              <div className="text-[11px] text-muted-foreground">Txns</div>
            </div>
            <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
              <Zap className="h-5 w-5 mx-auto mb-1.5 text-primary" />
              <div className="text-[11px] text-muted-foreground">Contracts</div>
            </div>
          </div>

          <Button asChild size="lg" className="gap-2">
            <a href={EXPLORER_URL} target="_blank" rel="noopener noreferrer">
              Open Explorer
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>

          <p className="mt-6 text-xs text-muted-foreground font-mono break-all">
            {EXPLORER_URL}
          </p>
        </Card>
      </div>
    </Layout>
  )
}
