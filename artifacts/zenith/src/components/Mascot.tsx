import mascotUrl from '@/assets/zenith-mascot.png'

interface MascotProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeMap = {
  sm: 'h-32',
  md: 'h-48',
  lg: 'h-72',
  xl: 'h-96',
}

export function Mascot({ className = '', size = 'lg' }: MascotProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full opacity-60 animate-pulse-slow" />
      <img
        src={mascotUrl}
        alt="Zenith Eagle Mascot"
        className={`relative ${sizeMap[size]} w-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:scale-[1.02] transition-transform duration-500`}
        draggable={false}
      />
    </div>
  )
}

export { mascotUrl as zenithMascotUrl }
