'use client'

import { Stack, TableCell, TableRow, Typography } from '@mui/material'
import { formatEther } from 'ethers/lib/utils'

import useUserAirdrops from '@/hooks/lending/useUserAirdrops'
import getTranslation from '@/hooks/useTranslation'
import useKsuPrice from '@/hooks/web3/useKsuPrice'

import CustomTable from '@/components/molecules/CustomTable'

import { convertFromUSD, formatAmount, toBigNumber } from '@/utils'

const TICKET_USD_VALUE = 50

const Airdrops = () => {
  const { t } = getTranslation()

  const { userAirdrops } = useUserAirdrops()

  const { ksuPrice } = useKsuPrice()

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
          const airdropsOwed = airdrops.ticketsOwed * TICKET_USD_VALUE

          const airDropsOwedInKSU = convertFromUSD(
            toBigNumber(airdropsOwed.toString()),
            toBigNumber(ksuPrice || '0')
          )

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
                <Stack>
                  <Typography variant='baseSm'>
                    {formatAmount(formatEther(airDropsOwedInKSU), {
                      minDecimals: 2,
                    })}{' '}
                    KASU
                  </Typography>
                  <Typography variant='baseSm' color='gray.middle'>
                    {formatAmount(airdropsOwed, {
                      minDecimals: 2,
                    })}{' '}
                    USDC
                  </Typography>
                </Stack>
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
