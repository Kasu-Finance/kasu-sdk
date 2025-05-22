'use client'

import { Button, Stack, TableCell, TableRow, Typography } from '@mui/material'
import { formatEther, parseEther } from 'ethers/lib/utils'

import useKsuPrice from '@/hooks/web3/useKsuPrice'

import DottedDivider from '@/components/atoms/DottedDivider'
import CustomTable from '@/components/molecules/CustomTable'

import { CopyIcon } from '@/assets/icons'

import { customPalette } from '@/themes/palette'
import { customTypography } from '@/themes/typography'
import { convertToUSD, formatAmount, toBigNumber } from '@/utils'

const ReferralBonus = () => {
  const { ksuPrice } = useKsuPrice()

  const referralBonus = '1000'

  const referralBonusInUSD = convertToUSD(
    toBigNumber(referralBonus),
    parseEther(ksuPrice || '0')
  )

  const claimableBalance = '1000'

  const claimableBalanceInUSD = convertToUSD(
    toBigNumber(claimableBalance),
    parseEther(ksuPrice || '0')
  )

  return (
    <Stack>
      <CustomTable
        tableHeader={
          <TableRow>
            <TableCell width='20%'>Bonus</TableCell>
            <TableCell width='15%' align='right'>
              Successful Referrals
            </TableCell>
            <TableCell width='19%' align='right'>
              Referral Bonus - Last Epoch
            </TableCell>
            <TableCell width='19%' align='right'>
              Referral Bonus - Lifetime
            </TableCell>
            <TableCell width='14%' align='right'>
              Claimable Balance
            </TableCell>
            <TableCell width='13%' align='right'>
              Action
            </TableCell>
          </TableRow>
        }
        tableBody={
          <TableRow>
            <TableCell>Referral Bonus</TableCell>
            <TableCell align='right'>15</TableCell>
            <TableCell align='right'>
              <Typography variant='baseSm'>
                {formatAmount(referralBonus, { minDecimals: 2 })} KASU
                <br />
                <Typography variant='inherit' color='gray.middle'>
                  {formatAmount(formatEther(referralBonusInUSD), {
                    minDecimals: 2,
                  })}{' '}
                  USDC
                </Typography>
              </Typography>
            </TableCell>
            <TableCell align='right'>
              {formatAmount(2000, { minDecimals: 2 })} KASU
            </TableCell>
            <TableCell align='right'>
              <Typography variant='baseSm'>
                {formatAmount(claimableBalance, { minDecimals: 2 })} KASU
                <br />
                <Typography variant='inherit' color='gray.middle'>
                  {formatAmount(formatEther(claimableBalanceInUSD), {
                    minDecimals: 2,
                  })}{' '}
                  USDC
                </Typography>
              </Typography>
            </TableCell>
            <TableCell align='right'>Claim</TableCell>
          </TableRow>
        }
        sx={{
          bgcolor: 'white',
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
        }}
        tableSx={{
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        }}
      />
      <Stack
        px={2}
        bgcolor='white'
        sx={{
          borderBottomLeftRadius: 8,
          borderBottomRightRadius: 8,
        }}
      >
        <DottedDivider />
        <Typography variant='baseSm' my={3}>
          Use your referral link to invite friends and get a reward.{' '}
          <Button
            variant='text'
            sx={{
              textTransform: 'unset',
              display: 'inline-flex',
              alignItems: 'center',
              p: 0,
              height: 15,
              mt: -0.2,
              ...customTypography.baseSm,
              '.MuiButton-endIcon svg': {
                width: 13,
                height: 'auto',
                path: {
                  fill: customPalette.gold.dark,
                },
              },
            }}
            endIcon={<CopyIcon />}
          >
            <Typography variant='inherit'>Copy your link</Typography>
          </Button>
        </Typography>
      </Stack>
    </Stack>
  )
}

export default ReferralBonus
