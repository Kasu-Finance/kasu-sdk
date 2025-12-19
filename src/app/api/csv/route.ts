import { formatEther, formatUnits } from 'ethers/lib/utils'
import { NextRequest } from 'next/server'

import { getKasuSDK } from '@/actions/getKasuSDK'
import { getCurrentEpoch } from '@/app/_requests/currentEpoch'
import {
  LENDERS_AGREEMENT_API,
  LENDERS_AGREEMENT_CHAIN_ID_MAP,
  LoanTicketDtoRaw,
  LoanTicketRes,
  LoanTicketStatus,
} from '@/config/api.lendersAgreement'
import dayjs from '@/dayjs'
import { isSupportedChain } from '@/utils'
import convertToUSD from '@/utils/convertToUSD'
import { createCsv } from '@/utils/csv'
import { getRequiredEnv } from '@/utils/env'
import getDetailedTransactions from '@/utils/lending/getDetailedTransactions'
import getWithdrawalTransactions from '@/utils/lending/getWithdrawalTransactions'
import mapFixedLoanToConfig from '@/utils/lending/mapFixedLoanToConfig'
import toBigNumber from '@/utils/toBigNumber'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type CsvKind =
  | 'portfolio-lending'
  | 'transactions-lending-requests'
  | 'transactions-withdrawal-requests'
  | 'rewards'

type EndBorrowerInfoRes =
  | {
      name: string
      endBorrowerID: string
      poolID: string
    }[]
  | {
      statusCode: number
      message: string
    }

const parseLocale = (req: NextRequest) => {
  const acceptLanguage = req.headers.get('accept-language')
  const locale = acceptLanguage?.split(',')?.[0]?.trim()
  return locale || 'en-US'
}

const safeTimeZone = (timeZone: string | undefined) => {
  if (!timeZone) return undefined
  try {
    new Intl.DateTimeFormat(undefined, { timeZone }).format(new Date())
    return timeZone
  } catch {
    return undefined
  }
}

const formatTimestampForFilename = (date: Date, timeZone?: string) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    ...(timeZone ? { timeZone } : {}),
  }).formatToParts(date)

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? ''

  return `${get('year')}-${get('month')}-${get('day')}_${get('hour')}-${get('minute')}-${get('second')}`
}

const formatUnixSeconds = (
  unixSeconds: EpochTimeStamp,
  locale: string,
  timeZone?: string
) => {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    ...(timeZone ? { timeZone } : {}),
  }).format(new Date(Number(unixSeconds) * 1000))
}

const formatNumber = (
  value: string | number,
  locale: string,
  {
    minFractionDigits = 2,
    maxFractionDigits = 2,
  }: { minFractionDigits?: number; maxFractionDigits?: number } = {}
) => {
  const numeric = typeof value === 'string' ? parseFloat(value) : value
  if (!Number.isFinite(numeric)) return ''

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: minFractionDigits,
    maximumFractionDigits: maxFractionDigits,
  }).format(numeric)
}

const formatPercent = (value: string | number, locale: string) => {
  const numeric = typeof value === 'string' ? parseFloat(value) : value
  if (!Number.isFinite(numeric)) return ''

  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numeric)
}

const isHexAddress = (value: string) => /^0x[a-fA-F0-9]{40}$/.test(value)

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams

  const kind = searchParams.get('kind') as CsvKind | null
  const address = searchParams.get('address')?.toLowerCase()
  const epochIdParam = searchParams.get('epochId') ?? undefined
  const chainIdParam = searchParams.get('chainId') ?? undefined
  const fileBaseName = searchParams.get('fileBaseName') || 'kasu'
  const timeZone = safeTimeZone(searchParams.get('timeZone') ?? undefined)

  if (!kind) {
    return Response.json({ message: 'Missing kind' }, { status: 400 })
  }

  if (!address || !isHexAddress(address)) {
    return Response.json(
      { message: 'Missing/invalid address' },
      { status: 400 }
    )
  }

  const userAddress = address as `0x${string}`

  const locale = parseLocale(req)

  const now = new Date()
  const timestamp = formatTimestampForFilename(now, timeZone)

  const sdk = await getKasuSDK()

  if (kind === 'portfolio-lending') {
    const epochId = epochIdParam ?? (await getCurrentEpoch())

    const poolOverviews = await sdk.DataService.getPoolOverview(epochId)

    const portfolioLendingPools = await sdk.Portfolio.getPortfolioLendingData(
      userAddress,
      poolOverviews,
      epochId
    )

    const headers = [
      'Pool Name',
      'Pool ID',
      'Tranche Name',
      'Tranche ID',
      'Term Type',
      'Fixed Config ID',
      'Gross APY',
      'Invested (USDC)',
      'Yield Last Epoch (USDC)',
      'Yield Lifetime (USDC)',
    ]

    const rows = portfolioLendingPools.flatMap((pool) =>
      pool.tranches.flatMap((tranche) => {
        const output: (string | number | null | undefined)[][] = []

        const hasVariablePosition =
          parseFloat(tranche.investedAmount) > 0 ||
          parseFloat(tranche.yieldEarnings.lifetime) > 0

        if (hasVariablePosition) {
          output.push([
            pool.poolName,
            pool.id,
            tranche.name,
            tranche.id,
            'Variable',
            '',
            formatPercent(tranche.apy, locale),
            formatNumber(tranche.investedAmount, locale),
            formatNumber(tranche.yieldEarnings.lastEpoch, locale),
            formatNumber(tranche.yieldEarnings.lifetime, locale),
          ])
        }

        const fixedConfigs = mapFixedLoanToConfig(
          tranche.fixedLoans,
          tranche.fixedTermConfig
        )

        for (const fixedConfig of fixedConfigs) {
          output.push([
            pool.poolName,
            pool.id,
            tranche.name,
            tranche.id,
            'Fixed',
            fixedConfig.configId,
            formatPercent(fixedConfig.apy, locale),
            formatNumber(fixedConfig.investedAmount, locale),
            formatNumber(fixedConfig.yieldEarnings.lastEpoch, locale),
            formatNumber(fixedConfig.yieldEarnings.lifetime, locale),
          ])
        }

        return output
      })
    )

    const csv = createCsv({ headers, rows })
    const filename = `${fileBaseName}_portfolio-lending_${timestamp}.csv`

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  }

  if (kind === 'transactions-lending-requests') {
    const epochId = epochIdParam ?? (await getCurrentEpoch())

    if (!chainIdParam) {
      return Response.json({ message: 'Missing chainId' }, { status: 400 })
    }

    const chain = parseInt(chainIdParam)
    if (!isSupportedChain(chain)) {
      return Response.json(
        { message: 'ChainId is not supported' },
        { status: 400 }
      )
    }

    const userRequests = await sdk.UserLending.getUserRequests(
      userAddress,
      epochId
    )
    const transactionHistory = userRequests.sort(
      (a, b) => b.timestamp - a.timestamp
    )

    const headers = {
      'x-api-key': getRequiredEnv('LENDERS_AGREEMENT_API_KEY'),
      'x-chain-id': LENDERS_AGREEMENT_CHAIN_ID_MAP[chain],
      'Content-Type': 'application/json',
    }

    const [loanTicketRes, endBorrowerInfoRes] = await Promise.all([
      fetch(
        `${LENDERS_AGREEMENT_API}/allocations/loan-tickets?` +
          new URLSearchParams({
            userID: userAddress,
            offset: '0',
            limit: '10000',
          }),
        { headers }
      ),
      fetch(`${LENDERS_AGREEMENT_API}/allocations/end-borrower-names`, {
        headers,
      }),
    ])

    const endBorrowerInfo: EndBorrowerInfoRes = await endBorrowerInfoRes.json()
    if ('statusCode' in endBorrowerInfo) {
      return Response.json(
        { message: endBorrowerInfo.message },
        { status: 502 }
      )
    }

    const loanTicket: LoanTicketRes = await loanTicketRes.json()
    if ('statusCode' in loanTicket) {
      return Response.json({ message: loanTicket.message }, { status: 502 })
    }

    const loanTickets = loanTicket.items.map((item: LoanTicketDtoRaw) => {
      const endBorrower = endBorrowerInfo.find(
        (eb) =>
          eb.endBorrowerID === item.endBorrowerID && eb.poolID === item.poolID
      )

      return {
        ...item,
        endBorrowerName: (endBorrower?.name ?? item.endBorrowerID)
          .replace(/\([^()]*\)/g, '')
          .trim(),
        dailyGroupID: dayjs(item.createdOn).startOf('day').toISOString(),
      }
    })

    const detailedTransactions = getDetailedTransactions(
      transactionHistory,
      loanTickets
    )

    const headersRow = [
      'Event Timestamp',
      'Last Transaction Date',
      'Pool Name',
      'Pool ID',
      'Tranche Name',
      'Tranche ID',
      'Event Type',
      'Event Status',
      'Amount (USDC)',
      'Epoch ID',
      'Transaction Hash',
      'Opt In/Out Decision Pending',
    ]

    const rows = detailedTransactions.flatMap((transaction) => {
      const decisionPending =
        transaction.currentDecisionStatus?.status === LoanTicketStatus.emailSent
          ? 'Yes'
          : 'No'

      return transaction.events.map((event) => [
        formatUnixSeconds(event.timestamp, locale, timeZone),
        formatUnixSeconds(transaction.lastTransactionDate, locale, timeZone),
        transaction.poolName,
        transaction.poolId,
        event.trancheName,
        transaction.trancheId,
        event.type,
        event.status,
        formatNumber(event.amount, locale),
        event.epochId,
        event.transactionHash,
        decisionPending,
      ])
    })

    const csv = createCsv({ headers: headersRow, rows })
    const filename = `${fileBaseName}_transactions-lending-requests_${timestamp}.csv`

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  }

  if (kind === 'transactions-withdrawal-requests') {
    const epochId = epochIdParam ?? (await getCurrentEpoch())

    const userRequests = await sdk.UserLending.getUserRequests(
      userAddress,
      epochId
    )
    const transactionHistory = userRequests.sort(
      (a, b) => b.timestamp - a.timestamp
    )

    const withdrawalTransactions = getWithdrawalTransactions(transactionHistory)

    const headers = [
      'Event Timestamp',
      'Last Transaction Date',
      'Pool Name',
      'Pool ID',
      'Tranche Name',
      'Tranche ID',
      'Event Status',
      'Amount (USDC)',
      'Remaining Queued Amount (USDC)',
      'Epoch ID',
      'Transaction Hash',
    ]

    const rows = withdrawalTransactions.flatMap((transaction) =>
      transaction.events.map((event) => [
        formatUnixSeconds(event.timestamp, locale, timeZone),
        formatUnixSeconds(transaction.lastTransactionDate, locale, timeZone),
        transaction.poolName,
        transaction.poolId,
        event.trancheName,
        transaction.trancheId,
        event.status,
        formatNumber(event.amount, locale),
        formatNumber(event.remainingQueuedAmount, locale),
        event.epochId,
        event.transactionHash,
      ])
    )

    const csv = createCsv({ headers, rows })
    const filename = `${fileBaseName}_transactions-withdrawal-requests_${timestamp}.csv`

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  }

  if (kind === 'rewards') {
    const [portfolioRewards, kasuPrice] = await Promise.all([
      sdk.Portfolio.getPortfolioRewards(userAddress),
      sdk.Locking.getKasuTokenPrice(),
    ])

    const ksuPrice = formatUnits(kasuPrice.price, kasuPrice.decimals)
    const ksuPriceBig = toBigNumber(ksuPrice)

    const headers = [
      'Reward',
      'Claimable Balance',
      'Claimable Balance (USD)',
      'Lifetime Rewards',
      'Lifetime Rewards (USD)',
      'KSU Price (USD)',
    ]

    const ksuToUsd = (ksuAmount: string) =>
      formatEther(convertToUSD(toBigNumber(ksuAmount), ksuPriceBig))

    const rows = [
      [
        'Bonus Yield Earnings',
        `${formatNumber(portfolioRewards.bonusYieldEarnings.claimableBalance.ksuAmount, locale)} KASU`,
        `${formatNumber(ksuToUsd(portfolioRewards.bonusYieldEarnings.claimableBalance.ksuAmount), locale)} USDC`,
        `${formatNumber(portfolioRewards.bonusYieldEarnings.lifeTime.ksuAmount, locale)} KASU`,
        `${formatNumber(ksuToUsd(portfolioRewards.bonusYieldEarnings.lifeTime.ksuAmount), locale)} USDC`,
        formatNumber(ksuPrice, locale, {
          minFractionDigits: 2,
          maxFractionDigits: 6,
        }),
      ],
      [
        'Protocol Fees',
        `${formatNumber(portfolioRewards.protocolFees.claimableBalance.usdcAmount, locale)} USDC`,
        '',
        `${formatNumber(portfolioRewards.protocolFees.lifeTime.usdcAmount, locale)} USDC`,
        '',
        formatNumber(ksuPrice, locale, {
          minFractionDigits: 2,
          maxFractionDigits: 6,
        }),
      ],
      [
        'KSU Launch Bonus',
        '-',
        '',
        `${formatNumber(portfolioRewards.ksuLaunchBonus.lifeTime.ksuAmount, locale)} KASU`,
        `${formatNumber(ksuToUsd(portfolioRewards.ksuLaunchBonus.lifeTime.ksuAmount), locale)} USDC`,
        formatNumber(ksuPrice, locale, {
          minFractionDigits: 2,
          maxFractionDigits: 6,
        }),
      ],
    ]

    const csv = createCsv({ headers, rows })
    const filename = `${fileBaseName}_rewards_${timestamp}.csv`

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  }

  return Response.json({ message: 'Unknown kind' }, { status: 400 })
}
