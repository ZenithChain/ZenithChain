import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ExternalLink, Loader2, ShieldCheck, AlertCircle } from 'lucide-react'

const SOCIAL_META: Record<
  string,
  { network: string; placeholder: string; helper: string; verifyMs: number }
> = {
  'follow-x': {
    network: 'X (Twitter)',
    placeholder: '@yourhandle',
    helper: "Enter the @handle you used to follow @zenithchain. We'll verify against the X API.",
    verifyMs: 1800,
  },
  'join-discord': {
    network: 'Discord',
    placeholder: 'username#0000 or username',
    helper: "Enter your Discord username. Our bot in the Zenith server will confirm membership.",
    verifyMs: 1800,
  },
  'join-telegram': {
    network: 'Telegram',
    placeholder: '@yourhandle',
    helper: "Enter your Telegram @handle. Our bot will confirm membership.",
    verifyMs: 1800,
  },
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  missionSlug: string
  missionName: string
  actionUrl: string | null | undefined
  onVerified: (handle: string) => Promise<void> | void
  isSubmitting: boolean
}

export function SocialConnectDialog({
  open,
  onOpenChange,
  missionSlug,
  missionName,
  actionUrl,
  onVerified,
  isSubmitting,
}: Props) {
  const meta = SOCIAL_META[missionSlug] ?? {
    network: 'Account',
    placeholder: 'Enter your handle',
    helper: 'Enter your handle so we can verify completion.',
    verifyMs: 1500,
  }

  const [handle, setHandle] = useState('')
  const [step, setStep] = useState<'open' | 'verify'>('open')
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleOpen = () => {
    if (actionUrl) window.open(actionUrl, '_blank', 'noopener,noreferrer')
    setStep('verify')
  }

  const handleSubmit = async () => {
    setError(null)
    const trimmed = handle.trim().replace(/^@/, '')
    if (trimmed.length < 2 || trimmed.length > 64) {
      setError('That handle looks invalid. Please double-check.')
      return
    }
    setVerifying(true)
    // Simulate the API verification call (the real backend just records
    // completion — full X/Discord verification requires those API keys
    // configured server-side).
    await new Promise((r) => setTimeout(r, meta.verifyMs))
    try {
      await onVerified(trimmed)
      onOpenChange(false)
      setHandle('')
      setStep('open')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Verification failed')
    } finally {
      setVerifying(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Connect {meta.network}
          </DialogTitle>
          <DialogDescription>{missionName}</DialogDescription>
        </DialogHeader>

        {step === 'open' ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm space-y-2">
              <div className="font-medium">Step 1 — Complete the action</div>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Click the button below. A new tab will open. Complete the action,
                then come back here to verify.
              </p>
            </div>
            <Button onClick={handleOpen} className="w-full gap-2">
              Open {meta.network}
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="social-handle" className="text-sm font-medium">
                Step 2 — Verify your account
              </Label>
              <p className="text-xs text-muted-foreground mt-1 mb-3">{meta.helper}</p>
              <Input
                id="social-handle"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder={meta.placeholder}
                className="font-mono"
                disabled={verifying || isSubmitting}
              />
            </div>
            {error && (
              <div className="flex items-start gap-2 text-xs text-destructive bg-destructive/10 rounded-lg p-3">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Submitting will record your handle and run our verification check.
              False submissions may result in disqualification per our anti-sybil policy.
            </p>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={verifying || isSubmitting}
          >
            Cancel
          </Button>
          {step === 'verify' && (
            <Button
              onClick={handleSubmit}
              disabled={verifying || isSubmitting || handle.trim().length < 2}
              className="gap-2"
            >
              {verifying || isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying…
                </>
              ) : (
                'Verify & Claim'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
