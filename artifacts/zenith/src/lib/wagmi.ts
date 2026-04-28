import { http, createConfig } from 'wagmi'
import { injected, metaMask, walletConnect, coinbaseWallet } from 'wagmi/connectors'
import { defineChain } from 'viem'

export const ZENITH_CHAIN_ID = 95749

export const zenithTestnet = defineChain({
  id: ZENITH_CHAIN_ID,
  name: 'Zenith Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Zenith',
    symbol: 'ZTH',
  },
  rpcUrls: {
    default: { http: ['https://rpc.zenithchain.xyz'] },
    public: { http: ['https://rpc.zenithchain.xyz'] },
  },
  blockExplorers: {
    default: {
      name: 'Zenith Explorer',
      url: 'https://explorer.zenithchain.xyz',
    },
  },
  testnet: true,
})

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as
  | string
  | undefined

const baseConnectors = [
  injected({ shimDisconnect: true }),
  metaMask({
    dappMetadata: {
      name: 'Zenith Genesis Campaign',
      url: typeof window !== 'undefined' ? window.location.origin : 'https://zenithchain.xyz',
    },
  }),
  coinbaseWallet({
    appName: 'Zenith Genesis Campaign',
  }),
]

const connectors = projectId
  ? [
      ...baseConnectors,
      walletConnect({
        projectId,
        metadata: {
          name: 'Zenith Genesis Campaign',
          description: 'Mission Control for the Zenith Testnet',
          url:
            typeof window !== 'undefined'
              ? window.location.origin
              : 'https://zenithchain.xyz',
          icons: [],
        },
        showQrModal: true,
      }),
    ]
  : baseConnectors

export const config = createConfig({
  chains: [zenithTestnet],
  connectors,
  multiInjectedProviderDiscovery: true,
  transports: {
    [zenithTestnet.id]: http('https://rpc.zenithchain.xyz'),
  },
})

export const HAS_WALLETCONNECT = !!projectId
