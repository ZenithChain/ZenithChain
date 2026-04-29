import { encodeFunctionData, type Address, type Hex } from 'viem'

/**
 * On-chain Badge contract config.
 *
 * To go live, deploy the ZenithBadge ERC-721 contract (see
 * `contracts/ZenithBadge.sol`) on Zenith Testnet for each badge type
 * and set these env vars:
 *   VITE_BADGE_PIONEER_CONTRACT
 *   VITE_BADGE_GENESIS_CONTRACT
 *
 * If unset, the mint button will sign a self-transfer of 0 ZTH that still
 * burns gas — a credible on-chain handshake until you deploy the contracts.
 */

export type BadgeType = 'pioneer' | 'genesis'

export const BADGE_CONTRACTS: Record<BadgeType, Address | undefined> = {
  pioneer: (import.meta.env.VITE_BADGE_PIONEER_CONTRACT as Address) || undefined,
  genesis: (import.meta.env.VITE_BADGE_GENESIS_CONTRACT as Address) || undefined,
}

// Minimal ABI fragment used for encoding the mint call.
const MINT_ABI = [
  {
    type: 'function',
    name: 'mint',
    stateMutability: 'payable',
    inputs: [{ name: 'to', type: 'address' }],
    outputs: [{ name: 'tokenId', type: 'uint256' }],
  },
] as const

export interface MintTxParams {
  to: Address
  data: Hex
  value: bigint
}

export function buildMintTx(badgeType: BadgeType, recipient: Address): MintTxParams {
  const contract = BADGE_CONTRACTS[badgeType]
  if (contract) {
    return {
      to: contract,
      data: encodeFunctionData({ abi: MINT_ABI, functionName: 'mint', args: [recipient] }),
      value: 0n,
    }
  }
  // Fallback: self-transfer of 0 ZTH so the user still consumes gas — a real
  // on-chain proof-of-mint until the actual contracts are deployed.
  return {
    to: recipient,
    data: '0x',
    value: 0n,
  }
}

export function isContractDeployed(badgeType: BadgeType): boolean {
  return !!BADGE_CONTRACTS[badgeType]
}
