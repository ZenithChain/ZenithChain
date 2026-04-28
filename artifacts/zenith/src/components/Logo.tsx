import logoUrl from '@/assets/zenith-logo.png'

interface LogoProps {
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeMap = {
  sm: 'h-7 w-7',
  md: 'h-9 w-9',
  lg: 'h-12 w-12',
  xl: 'h-20 w-20',
}

export function Logo({ className = '', showText = true, size = 'md' }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className={`relative ${sizeMap[size]} flex-shrink-0`}>
        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
        <img
          src={logoUrl}
          alt="Zenith"
          className={`relative ${sizeMap[size]} object-contain drop-shadow-[0_0_12px_hsl(var(--primary)/0.5)]`}
        />
      </div>
      {showText && (
        <span className="font-bold text-xl md:text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-primary">
          ZENITH
        </span>
      )}
    </div>
  )
}

export function ZthCoinIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <img
      src={logoUrl}
      alt="ZTH"
      className={`${className} object-contain inline-block align-middle`}
    />
  )
}

export { logoUrl as zenithLogoUrl }
