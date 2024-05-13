import ReceiptIcon from '@mui/icons-material/Receipt'
import {
  Box,
  Button,
  Divider,
  TableCell,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material'
import React from 'react'

import useTranslation from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'
import PoolAvatar from '@/components/atoms/PoolAvatar'
import { ClosedPoolData } from '@/components/molecules/home/ClosedPoolsTable'

import { formatAmount, formatPercentage } from '@/utils'

interface RowProps {
  data: ClosedPoolData
}

const ClosedPoolsTableRow: React.FC<RowProps> = ({ data }) => {
  const { t } = useTranslation()
  const theme = useTheme()

  return (
    <TableRow>
      <TableCell align='left' width='30%'>
        <Box display='flex' alignItems='center' mb={1}>
          <PoolAvatar
            src={data?.poolImage}
            name={data?.poolName}
            showStatus
            badgeColor={theme.palette.error.main}
          />
          <Typography variant='h6' component='h1' ml={1} fontWeight={700}>
            {data?.poolName || 'N/A'}
          </Typography>
        </Box>
        <Divider />

        <Box display='flex' justifyContent='space-between' mt={0.5}>
          <InfoRow
            title={t(`details.poolDetails.assetClass.label`)}
            toolTipInfo=''
            metric={
              <Typography variant='subtitle2'>
                {data?.assetClass || 'N/A'}
              </Typography>
            }
            sx={{ p: 0 }}
          />
        </Box>
        <Button
          sx={{ p: '0.375rem 1rem', mt: 1, fontSize: '14px' }}
          variant='outlined'
          startIcon={<ReceiptIcon />}
          href='#'
          target='_blank'
        >
          VIEW
        </Button>
      </TableCell>
      <TableCell align='right'>
        <Box display='flex' justifyContent='flex-end' flexDirection='column'>
          {data?.tranches.map((tranche, index) => {
            const isMultiTranche = data.tranches.length > 1

            if (!isMultiTranche) {
              return (
                <Typography
                  key={tranche.id}
                  variant='subtitle2'
                  sx={{ pl: 2, mt: 0.5 }}
                >
                  {formatPercentage(tranche.apy)}
                </Typography>
              )
            }

            return (
              <Box key={tranche.apy}>
                <Typography pt={0.5}>
                  {formatPercentage(tranche.apy)}
                </Typography>
                <Typography
                  variant='caption'
                  color='text.secondary'
                  component='p'
                  pb={0.5}
                >
                  {isMultiTranche
                    ? t(`lending.tranche.${tranche.name.toLowerCase()}`)
                    : ''}
                </Typography>

                {index < data.tranches.length - 1 && <Divider />}
              </Box>
            )
          })}
        </Box>
      </TableCell>
      <TableCell align='right'>
        <Typography variant='subtitle2'>
          {formatAmount(data?.totalValueLocked, { roundingScale: 'auto' })}
          <Typography variant='caption'> USDC</Typography>
        </Typography>
      </TableCell>
      <TableCell align='right'>
        <Typography variant='subtitle2'>
          {formatAmount(data?.loansUnderManagement, { roundingScale: 'auto' })}
          <Typography variant='caption'> USDC</Typography>
        </Typography>
      </TableCell>
      <TableCell align='right'>
        <Typography variant='subtitle2'>
          {formatAmount(data?.totalFunds, { roundingScale: 'auto' })}
          <Typography variant='caption'> USDC</Typography>
        </Typography>
      </TableCell>
      <TableCell align='right'>
        <Typography variant='subtitle2'>
          {formatPercentage(data?.totalLossRate || 0)}
        </Typography>
      </TableCell>
    </TableRow>
  )
}

export default ClosedPoolsTableRow
