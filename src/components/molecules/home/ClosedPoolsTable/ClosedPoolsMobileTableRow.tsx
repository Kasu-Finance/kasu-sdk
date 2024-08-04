import ReceiptIcon from '@mui/icons-material/Receipt'
import {
  Box,
  Button,
  TableCell,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material'
import React from 'react'

import useTranslation from '@/hooks/useTranslation'

import BoxBackground from '@/components/atoms/BoxBackground'
import ColoredBox from '@/components/atoms/ColoredBox'
import InfoColumn from '@/components/atoms/InfoColumn'
import InfoRow from '@/components/atoms/InfoRow'
import PoolAvatar from '@/components/atoms/PoolAvatar'
import { ClosedPoolData } from '@/components/molecules/home/ClosedPoolsTable'

import { formatAmount, formatPercentage } from '@/utils'

interface RowProps {
  data: ClosedPoolData
}

const ClosedPoolsMobileTableRow: React.FC<RowProps> = ({ data }) => {
  const { t } = useTranslation()
  const theme = useTheme()

  return (
    <>
      <TableRow>
        <TableCell sx={{ p: 1, border: 'none' }} />
      </TableRow>
      <TableRow sx={{ bgcolor: 'white' }}>
        <TableCell align='left' width='30%' sx={{ p: 0 }}>
          <BoxBackground
            display='flex'
            alignItems='center'
            mb={1}
            height={48}
            px={1}
          >
            <PoolAvatar
              src={data?.poolImage}
              name={data?.poolName}
              showStatus
              badgeColor={theme.palette.error.main}
              sx={{ width: 32, height: 32 }}
            />
            <Typography
              variant='h6'
              component='h1'
              ml={1}
              fontWeight={700}
              fontSize={16}
            >
              {data?.poolName || 'N/A'}
            </Typography>
          </BoxBackground>
          <Box px={1}>
            <ColoredBox sx={{ p: 1 }}>
              <Box
                display='grid'
                columnGap={1}
                gridTemplateColumns={`repeat(${data.tranches.length}, minmax(0, 1fr))`}
              >
                {data.tranches.map((tranche, index) => {
                  const titleKey =
                    data.tranches.length === 1
                      ? t('general.apy')
                      : t(`lending.tranche.${tranche.name.toLowerCase()}.title`)

                  return (
                    <InfoColumn
                      title={titleKey}
                      titleStyle={{
                        display: 'block',
                        maxWidth: 80,
                        fontSize: 12,
                        whiteSpace: 'normal',
                      }}
                      key={index}
                      titleContainerSx={(theme) => ({
                        [theme.breakpoints.down('sm')]: {
                          px: 0,
                        },
                      })}
                      showDivider
                      metric={
                        <Typography
                          variant='h5'
                          display='block'
                          px={{ xs: 0, sm: 2 }}
                          py={{ xs: 0, sm: '6px' }}
                        >
                          {formatPercentage(tranche.apy || '0')}
                        </Typography>
                      }
                    />
                  )
                })}
              </Box>
            </ColoredBox>
            <ColoredBox mt={1} sx={{ p: 1 }}>
              <InfoRow
                title={t(`details.poolDetails.assetClass.label`)}
                toolTipInfo={t(`details.poolDetails.assetClass.tooltip`)}
                titleStyle={{ fontSize: 12 }}
                sx={{
                  px: 0,
                  flexDirection: 'column',
                }}
                metric={
                  <>
                    <Typography
                      variant='subtitle2'
                      fontWeight={400}
                      whiteSpace='normal'
                    >
                      {data?.assetClass || 'N/A'}
                    </Typography>
                  </>
                }
              />
            </ColoredBox>
            <ColoredBox mt={1} sx={{ p: 1 }}>
              <InfoRow
                title={t('general.tvl')}
                titleStyle={{ fontSize: 12 }}
                sx={{ px: 0 }}
                showDivider
                metric={
                  <Typography
                    variant='subtitle2'
                    component='span'
                    fontSize={12}
                  >
                    {formatAmount(data?.totalValueLocked || '0', {
                      minValue: 1_000_000,
                    })}
                  </Typography>
                }
              />
              <InfoRow
                title={t('lending.poolOverview.detailCard.loansUnder.label')}
                titleStyle={{ fontSize: 12 }}
                sx={{ px: 0 }}
                showDivider
                metric={
                  <Typography
                    variant='subtitle2'
                    component='span'
                    fontSize={12}
                  >
                    {formatAmount(data?.loansUnderManagement || '0', {
                      minValue: 1_000_000,
                    })}
                  </Typography>
                }
              />
              <InfoRow
                title={t('details.poolDelegate.totalFunds.label')}
                titleStyle={{ fontSize: 12 }}
                sx={{ px: 0 }}
                showDivider
                metric={
                  <Typography
                    variant='subtitle2'
                    component='span'
                    fontSize={12}
                  >
                    {formatAmount(data?.totalFunds || '0', {
                      minValue: 1_000_000,
                    })}
                  </Typography>
                }
              />
              <InfoRow
                title={t('home.closedPools.table.lossRate')}
                titleStyle={{ fontSize: 12 }}
                sx={{ px: 0 }}
                metric={
                  <Typography
                    variant='subtitle2'
                    component='span'
                    fontSize={12}
                  >
                    {formatPercentage(data?.totalLossRate || 0)}
                  </Typography>
                }
              />
            </ColoredBox>
            <Button
              sx={{ p: '0.375rem 1rem', my: 1, fontSize: '14px' }}
              variant='outlined'
              startIcon={<ReceiptIcon />}
              href='#'
              target='_blank'
              fullWidth
            >
              VIEW
            </Button>
          </Box>
        </TableCell>
      </TableRow>
    </>
  )
}

export default ClosedPoolsMobileTableRow
