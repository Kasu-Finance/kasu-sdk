'use client'

import { Box, Typography } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import ColoredBox from '@/components/atoms/ColoredBox'
import InfoRow from '@/components/atoms/InfoRow'

interface InvestmentCardProps {
  title: string
  amount: string
  apy: string
  yieldEarned: string
}

const TranchInvestmentCard: React.FC<InvestmentCardProps> = ({
  title,
  amount,
  apy,
  yieldEarned,
}) => {
  const { t } = getTranslation()

  return (
    <ColoredBox borderRadius={2} p={{ xs: 1.5, sm: 0 }}>
      <Typography
        sx={(theme) => ({
          [theme.breakpoints.up('sm')]: { pl: 2, pt: 2, pb: 1 },
        })}
        variant='subtitle1'
        component='h6'
      >
        {title}
      </Typography>
      <InfoRow
        title={t('lending.poolOverview.investmentCard.amountInvested.label')}
        toolTipInfo={t(
          'lending.poolOverview.investmentCard.amountInvested.tooltip'
        )}
        titleStyle={{ fontSize: { xs: 12, sm: 14 } }}
        sx={(theme) => ({
          [theme.breakpoints.down('sm')]: {
            px: 0,
          },
        })}
        showDivider
        metric={
          <Box>
            <Typography
              variant='h6'
              component='span'
              fontSize={{ xs: 16, sm: 20 }}
            >
              {amount}{' '}
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
        title={t('lending.poolOverview.investmentCard.trancheApy.label')}
        toolTipInfo={t(
          'lending.poolOverview.investmentCard.trancheApy.tooltip'
        )}
        titleStyle={{ fontSize: { xs: 12, sm: 14 } }}
        sx={(theme) => ({
          [theme.breakpoints.down('sm')]: {
            px: 0,
          },
        })}
        showDivider
        metric={
          <Box>
            <Typography
              variant='h6'
              component='span'
              fontSize={{ xs: 16, sm: 20 }}
            >
              {apy}{' '}
              <Typography
                variant='body1'
                component='span'
                fontSize={{ xs: 12 }}
              >
                %
              </Typography>
            </Typography>
          </Box>
        }
      />
      <InfoRow
        title={t('lending.poolOverview.investmentCard.yieldEarned.label')}
        toolTipInfo={t(
          'lending.poolOverview.investmentCard.yieldEarned.tooltip'
        )}
        titleStyle={{ fontSize: { xs: 12, sm: 14 } }}
        sx={(theme) => ({
          [theme.breakpoints.down('sm')]: {
            px: 0,
          },
        })}
        metric={
          <Box>
            <Typography
              variant='h6'
              component='span'
              fontSize={{ xs: 16, sm: 20 }}
            >
              {yieldEarned}{' '}
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

export default TranchInvestmentCard
