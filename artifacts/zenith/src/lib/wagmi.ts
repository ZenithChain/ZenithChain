import { http, createConfig } from 'wagmi'
import { injected, walletConnect } from 'wagmi/connectors'
import { defineChain } from 'viem'

export const zenithTestnet = defineChain({
  id: 0x0201, // 513
  name: 'Zenith Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Zenith',
    symbol: 'ZTH',
  },
  rpcUrls: {
    default: { http: ['https://rpc.zenithchain.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Zenith Explorer', url: 'https://explorer.zenithchain.xyz' },
  },
})

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID

const connectors = [
  injected(),
]

if (projectId) {
  connectors.push(walletConnect({ projectId }))
}

export const config = createConfig({
  chains: [zenithTestnet],
  connectors,
  transports: {
    [zenithTestnet.id]: http(),
  },
})
