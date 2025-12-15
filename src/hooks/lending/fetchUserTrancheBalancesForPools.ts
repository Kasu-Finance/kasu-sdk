import {
  PoolOverview,
  TrancheData,
} from '@kasufinance/kasu-sdk/src/services/DataService/types'
import { UserTrancheBalance } from '@kasufinance/kasu-sdk/src/services/UserLending/types'
import { ethers } from 'ethers'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { gql, GraphQLClient } from 'graphql-request'

import sdkConfig from '@/config/sdk'
import { SupportedChainIds } from '@/connection/chains'
import { RPC_URLS } from '@/connection/rpc'

const lendingPoolTrancheAbi = [
  'function maxWithdraw(address owner) view returns (uint256)',
] as const

type PortfolioUserTrancheDetailsQueryResult = {
  user: {
    lendingPoolUserDetails: {
      lendingPool: { id: string }
      lendingPoolTrancheUserDetails: {
        shares: string
        totalAcceptedDeposits: string
        totalAcceptedWithdrawnAmount: string
        tranche: {
          id: string
          shares: string
          balance: string
        }
      }[]
    }[]
  } | null
}

const portfolioUserTrancheDetailsQuery = gql`
  query PortfolioUserTrancheDetailsQuery($userAddress: String!) {
    user(id: $userAddress) {
      lendingPoolUserDetails {
        lendingPool {
          id
        }
        lendingPoolTrancheUserDetails {
          shares
          totalAcceptedDeposits
          totalAcceptedWithdrawnAmount
          tranche {
            id
            shares
            balance
          }
        }
      }
    }
  }
`

const graphClient = new GraphQLClient(sdkConfig.subgraphUrl)

const convertSharesToAssets = (
  sharesAmount: string,
  totalAssets: string,
  totalSupply: string
): string => {
  if (parseUnits(totalSupply).isZero()) return '0'

  return formatUnits(
    parseUnits(sharesAmount)
      .mul(parseUnits(totalAssets.toString()))
      .div(parseUnits(totalSupply.toString()))
  )
}

export type TrancheWithBalanceData = TrancheData & {
  balanceData: UserTrancheBalance
}

export const fetchUserTrancheBalancesForPools = async <T extends PoolOverview>({
  chainId,
  pools,
  userAddressLower,
}: {
  chainId: number
  pools: T[]
  userAddressLower: string
}): Promise<TrancheWithBalanceData[]> => {
  const rpcUrl = RPC_URLS[chainId as SupportedChainIds]?.[0]
  if (!rpcUrl) {
    throw new Error(`RPC URL not configured for chainId=${chainId}`)
  }

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl)

  const result =
    await graphClient.request<PortfolioUserTrancheDetailsQueryResult>(
      portfolioUserTrancheDetailsQuery,
      { userAddress: userAddressLower }
    )

  type LendingPoolTrancheUserDetail = NonNullable<
    NonNullable<
      PortfolioUserTrancheDetailsQueryResult['user']
    >['lendingPoolUserDetails'][number]['lendingPoolTrancheUserDetails'][number]
  >

  const trancheDetailsById = new Map<string, LendingPoolTrancheUserDetail>()

  const poolUserDetails = result.user?.lendingPoolUserDetails ?? []
  for (const poolDetail of poolUserDetails) {
    for (const trancheDetail of poolDetail.lendingPoolTrancheUserDetails) {
      trancheDetailsById.set(
        trancheDetail.tranche.id.toLowerCase(),
        trancheDetail
      )
    }
  }

  const tranches = pools.flatMap((pool) => pool.tranches)

  return await Promise.all(
    tranches.map(async (tranche) => {
      const detail = trancheDetailsById.get(tranche.id.toLowerCase())

      const userBalance = detail
        ? convertSharesToAssets(
            detail.shares,
            detail.tranche.balance,
            detail.tranche.shares
          )
        : '0'

      const totalAcceptedDeposits = detail
        ? parseFloat(detail.totalAcceptedDeposits)
        : 0
      const totalAcceptedWithdrawals = detail
        ? parseFloat(detail.totalAcceptedWithdrawnAmount)
        : 0

      const yieldEarned =
        parseFloat(userBalance) -
        totalAcceptedDeposits -
        -totalAcceptedWithdrawals

      const trancheContract = new ethers.Contract(
        tranche.id,
        lendingPoolTrancheAbi,
        provider
      )
      const availableToWithdraw =
        await trancheContract.maxWithdraw(userAddressLower)

      const balanceData: UserTrancheBalance = {
        userId: userAddressLower,
        address: tranche.id,
        trancheId: tranche.id,
        yieldEarned,
        balance: userBalance,
        availableToWithdraw,
      }

      return {
        ...tranche,
        balanceData,
      }
    })
  )
}
