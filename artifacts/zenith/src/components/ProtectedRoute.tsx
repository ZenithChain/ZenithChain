import { useAccount } from 'wagmi'
import { useLocation } from 'wouter'
import { useEffect } from 'react'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isConnected } = useAccount()
  const [, setLocation] = useLocation()

  useEffect(() => {
    if (!isConnected) {
      setLocation('/')
    }
  }, [isConnected, setLocation])

  if (!isConnected) {
    return null
  }

  return <>{children}</>
}
