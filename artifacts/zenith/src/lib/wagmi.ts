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
    default: { http: ['https://rpc.zerithchain.xyz'] },
    public: { http: ['https://rpc.zerithchain.xyz'] },
  },
  blockExplorers: {
    default: {
      name: 'Zenith Explorer',
      url: 'https://explorer.zerithchain.xyz',
    },
  },
  testnet: true,
})

const DEFAULT_WC_PROJECT_ID = '35d9c44e3b991407b1292a4983356d8e'

const projectId =
  (import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string | undefined) ||
  DEFAULT_WC_PROJECT_ID

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
    [zenithTestnet.id]: http('https://rpc.zerithchain.xyz'),
  },
})

export const HAS_WALLETCONNECT = !!projectId
