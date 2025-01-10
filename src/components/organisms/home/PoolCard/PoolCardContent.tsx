import { Box, Typography } from '@mui/material'
import React from 'react'

import getTranslation from '@/hooks/useTranslation'

import CustomCardContentInner from '@/components/atoms/CustomCard/CustomInnerCardContent'
import InfoRow from '@/components/atoms/InfoRow'
import ToolTip from '@/components/atoms/ToolTip'
import UnorderedList from '@/components/atoms/UnorderedList'
import WaveBox from '@/components/atoms/WaveBox'
import GrossApyTooltip from '@/components/molecules/tooltips/GrossApyTooltip'

import { customTypography } from '@/themes/typography'
import { formatAmount, formatPercentage } from '@/utils'
import formatDuration from '@/utils/formats/formatDuration'

import { PoolOverviewWithDelegate } from '@/types/page'

type PoolCardContentProps = {
  pool: PoolOverviewWithDelegate
}

const PoolCardContent: React.FC<PoolCardContentProps> = ({ pool }) => {
  const { t } = getTranslation()

  const isMultiTranche = pool.tranches.length > 1

  const isActivePool = pool.isActive

  const { minApy, maxApy } = pool.tranches.reduce(
    (total, cur) => {
      total.minApy =
        total.minApy === 0 // check for initial value
          ? parseFloat(cur.minApy)
          : Math.min(total.minApy, parseFloat(cur.minApy))
      total.maxApy = Math.max(total.maxApy, parseFloat(cur.maxApy))

      return total
    },
    { minApy: 0, maxApy: 0 }
  )

  return (
    <WaveBox width='100%' height='100%' display='flex' flexDirection='column'>
      <Box
        display='flex'
        justifyContent='space-between'
        alignItems='end'
        my={3}
        px={2}
      >
        <Typography variant='h5' display='flex' alignItems='center'>
          {t('general.grossApy')} <ToolTip title={<GrossApyTooltip />} />
        </Typography>
        <Typography variant='h2' color='gold.dark'>
          {minApy === maxApy
            ? formatPercentage(maxApy, 0).replaceAll(' %', '%')
            : `${formatPercentage(minApy, 0).replaceAll(' %', '')}-${formatPercentage(maxApy, 0).replaceAll(' %', '%')}`}
        </Typography>
      </Box>
      <CustomCardContentInner display='flex' flexDirection='column' flex={1}>
        <InfoRow
          title={t('home.card.loanTranches')}
          titleStyle={{ variant: 'baseMd', color: 'gray.extraDark' }}
          toolTipInfo={t('home.card.loanTranches-tooltip')}
          showDivider
          metric={
            <Typography variant='baseMdBold'>
              {isMultiTranche
                ? pool.tranches
                    .toReversed()
                    .map((tranche) => tranche.name)
                    .join(', ')
                : t('home.card.singleLoanOffer')}
            </Typography>
          }
        />
        <InfoRow
          title={t('home.card.lendingAssetClass')}
          titleStyle={{ variant: 'baseMd', color: 'gray.extraDark' }}
          toolTipInfo={t('details.poolDetails.assetClass.tooltip')}
          showDivider
          metric={
            <Typography
              textAlign='right'
              maxWidth={180}
              height={63}
              variant='baseMdBold'
            >
              {pool.assetClass}
            </Typography>
          }
          sx={{
            alignItems: 'start',
          }}
        />
        {!isActivePool && (
          <InfoRow
            title={t('general.tvl')}
            titleStyle={{ variant: 'baseMd', color: 'gray.extraDark' }}
            toolTipInfo={t('lending.poolOverview.detailCard.tvl.tooltip')}
            showDivider
            metric={
              <Typography variant='baseMdBold'>
                {formatAmount(pool.totalValueLocked || '0', {
                  minValue: 1_000_000,
                })}{' '}
                USDC
              </Typography>
            }
          />
        )}
        {!isActivePool && (
          <InfoRow
            title={t('lending.poolOverview.detailCard.loansUnder.label')}
            titleStyle={{ variant: 'baseMd', color: 'gray.extraDark' }}
            toolTipInfo={t(
              'lending.poolOverview.detailCard.loansUnder.tooltip'
            )}
            showDivider
            metric={
              <Typography variant='baseMdBold'>
                {formatAmount(pool.loansUnderManagement || '0', {
                  minValue: 1_000_000,
                })}{' '}
                USDC
              </Typography>
            }
          />
        )}
        <InfoRow
          title={t('details.poolDelegate.totalFunds.label')}
          titleStyle={{ variant: 'baseMd', color: 'gray.extraDark' }}
          toolTipInfo={t('details.poolDelegate.totalFunds.tooltip')}
          showDivider
          metric={
            <Typography variant='baseMdBold'>
              {formatAmount(pool.delegate.totalLoanFundsOriginated || '0', {
                minValue: 1_000_000,
              })}{' '}
              USDC
            </Typography>
          }
        />
        <InfoRow
          title={t('details.poolDelegate.totalLossRate.label')}
          titleStyle={{ variant: 'baseMd', color: 'gray.extraDark' }}
          toolTipInfo={t('details.poolDelegate.totalLossRate.tooltip')}
          showDivider
          metric={
            <Typography variant='baseMdBold'>
              {formatPercentage(pool.delegate.historicLossRate)}
            </Typography>
          }
        />
        {isActivePool && (
          <InfoRow
            title={t('details.poolDelegate.history.label')}
            titleStyle={{ variant: 'baseMd', color: 'gray.extraDark' }}
            toolTipInfo={t('details.poolDelegate.history.tooltip')}
            showDivider
            metric={
              <Typography variant='baseMdBold'>
                {formatDuration(pool.delegate.delegateLendingHistory, {
                  years: true,
                  months: true,
                })}
              </Typography>
            }
          />
        )}
        {isActivePool && (
          <InfoRow
            title={t('lending.poolOverview.detailCard.security.label')}
            titleStyle={{ variant: 'baseMd', color: 'gray.extraDark' }}
            toolTipInfo={t('lending.poolOverview.detailCard.security.tooltip')}
            dividerProps={{
              style: {
                marginTop: 'auto',
              },
            }}
            showDivider
            metric={
              <UnorderedList
                sx={{
                  ...customTypography.baseMdBold,
                  pl: 2,
                  textAlign: 'right',
                  listStyleType: 'none',
                }}
              >
                {pool.security.length > 3 ? (
                  <>
                    <li key={0}>{pool.security[0]}</li>
                    <li key={1}>{pool.security[1]}</li>
                    <li key={2}>
                      <Typography variant='inherit' color='gray.middle'>
                        Other
                      </Typography>
                    </li>
                  </>
                ) : (
                  pool.security.map((security, index) => (
                    <li key={index}>{security}</li>
                  ))
                )}
              </UnorderedList>
            }
            sx={{
              height: '100%',
              alignItems: 'start',
            }}
          />
        )}
      </CustomCardContentInner>
    </WaveBox>
  )
}

export default PoolCardContent
