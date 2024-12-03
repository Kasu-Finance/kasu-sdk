'use client'

import { Box, Typography } from '@mui/material'
import React from 'react'

import useDeviceDetection, { Device } from '@/hooks/useDeviceDetections'
import getTranslation from '@/hooks/useTranslation'

import ColoredBox from '@/components/atoms/ColoredBox'
import InfoRow from '@/components/atoms/InfoRow'

interface TranchDetailCardProps {
  title: string
  remainingAmount: { pct: string; value: string }
  minimumDepositAmount: string
  maxDepositAmount: string
  isSingleTranche?: boolean
}

const TranchDetailCard: React.FC<TranchDetailCardProps> = ({
  title,
  remainingAmount,
  minimumDepositAmount,
  maxDepositAmount,
  isSingleTranche,
}) => {
  const { t } = getTranslation()

  const currentDevice = useDeviceDetection()

  return (
    <ColoredBox
      sx={(theme) => ({
        minWidth: 275,
        p: 0,
        borderRadius: 2,
        display: 'flex',
        flexDirection:
          isSingleTranche && currentDevice !== Device.MOBILE ? 'row' : 'column',

        [theme.breakpoints.down('sm')]: {
          p: 1,
        },
      })}
    >
      {title && (
        <Typography
          sx={(theme) => ({
            pl: 2,
            pt: 2,
            pb: 1,
            [theme.breakpoints.down('sm')]: {
              pl: 0,
              pt: 0,
              pb: 0,
            },
          })}
          variant='subtitle1'
          component='h6'
        >
          {title}
        </Typography>
      )}
      <InfoRow
        title={t('lending.poolOverview.trancheCard.remainingCapacity.label')}
        toolTipInfo={t(
          'lending.poolOverview.trancheCard.remainingCapacity.tooltip'
        )}
        titleStyle={{ fontSize: { xs: 12, sm: 14 } }}
        sx={(theme) => ({
          [theme.breakpoints.down('sm')]: {
            px: 0,
          },
        })}
        showDivider
        metric={
          <Box textAlign='right'>
            <Typography variant='body1' component='span'>
              {remainingAmount.pct} %
            </Typography>
            <Typography
              color='text.secondary'
              variant='caption'
              component='span'
              display='block'
            >
              {remainingAmount.value} USDC
            </Typography>
          </Box>
        }
      />
      <InfoRow
        title={t('lending.poolOverview.trancheCard.minDeposit')}
        titleStyle={{ fontSize: { xs: 12, sm: 14 } }}
        sx={(theme) => ({
          [theme.breakpoints.down('sm')]: {
            px: 0,
          },
        })}
        showDivider
        metric={
          <Box textAlign='right'>
            <Typography
              variant='h6'
              component='span'
              fontSize={{ xs: 16, sm: 20 }}
            >
              {minimumDepositAmount}{' '}
              <Typography
                variant='body1'
                component='span'
                fontSize={{ xs: 12 }}
              >
                USDC
              </Typography>
            </Typography>
          </Box>
        }
      />
      <InfoRow
        title={t('lending.poolOverview.trancheCard.maxDeposit')}
        titleStyle={{ fontSize: { xs: 12, sm: 14 } }}
        sx={(theme) => ({
          [theme.breakpoints.down('sm')]: {
            px: 0,
          },
        })}
        metric={
          <Box textAlign='right'>
            <Typography
              variant='h6'
              component='span'
              fontSize={{ xs: 16, sm: 20 }}
            >
              {maxDepositAmount}{' '}
              <Typography
                variant='body1'
                component='span'
                fontSize={{ xs: 12 }}
              >
                USDC
              </Typography>
            </Typography>
          </Box>
        }
      />
    </ColoredBox>
  )
}

export default TranchDetailCard
