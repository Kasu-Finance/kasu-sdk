'use client'

import { Stack, TableCell, TableRow, Typography } from '@mui/material'

import useUserAirdrops from '@/hooks/lending/useUserAirdrops'
import getTranslation from '@/hooks/useTranslation'

import CustomTable from '@/components/molecules/CustomTable'

import { formatAmount } from '@/utils'

const Airdrops = () => {
  const { t } = getTranslation()

  const { userAirdrops } = useUserAirdrops()

  if (!userAirdrops.length) return null

  return (
    <>
      <Typography variant='h4' color='rgba(205, 163, 112, 1)' px={2} py={2.3}>
        {t('portfolio.rewards.subheader-4.title')}
      </Typography>
      <CustomTable
        tableHeader={
          <TableRow>
            <TableCell width='30%'>Reward</TableCell>
            <TableCell width='14%' align='right'>
              Lending Amount
            </TableCell>
            <TableCell width='14%' align='right'>
              Accepted Epoch
            </TableCell>
            <TableCell width='14%' align='right'>
              Airdrops Owed
            </TableCell>
            <TableCell width='14%' align='right'>
              Airdrop Date
            </TableCell>
            <TableCell width='14%' align='right'>
              Airdrop Paid
            </TableCell>
          </TableRow>
        }
        tableBody={userAirdrops.map((airdrops) => {
          return (
            <TableRow key={airdrops.acceptedEpoch}>
              <TableCell>
                <Stack>
                  <Typography variant='baseSm'>Early Lending Bonus</Typography>
                  <Typography variant='baseSm' color='gray.middle'>
                    50 USDC free KASU for every 5,000 USDC of lending
                  </Typography>
                </Stack>
              </TableCell>
              <TableCell align='right'>
                {formatAmount(airdrops.lendingAmount, { minDecimals: 2 })}
              </TableCell>
              <TableCell align='right'>{airdrops.acceptedEpoch}</TableCell>
              <TableCell align='right'>
                <Typography variant='baseSm'>
                  {airdrops.ticketsOwed}x
                </Typography>
              </TableCell>
              <TableCell align='right'>
                TGE + 90 days
                {/* {formatTimestamp(0, { format: 'DD.MM.YYYY'}).date} */}
              </TableCell>
              <TableCell align='right'>-</TableCell>
            </TableRow>
          )
        })}
        sx={{
          bgcolor: 'white',
          borderRadius: 2,
        }}
      />
    </>
  )
}

export default Airdrops
