'use client'

import { Button, TableCell, TableRow, Typography } from '@mui/material'
import { formatEther, parseEther } from 'ethers/lib/utils'

import useModalState from '@/hooks/context/useModalState'
import useUserReferrals, {
  ReferredUserDetails,
} from '@/hooks/referrals/useUserReferrals'
import useKsuPrice from '@/hooks/web3/useKsuPrice'

import DottedDivider from '@/components/atoms/DottedDivider'

import { ModalsKeys } from '@/context/modal/modal.types'

import { PaperIcon } from '@/assets/icons'

import { customPalette } from '@/themes/palette'
import { customTypography } from '@/themes/typography'
import { convertToUSD, formatAmount, toBigNumber } from '@/utils'

const LiteReferralBonusTableBody = () => {
  const { ksuPrice } = useKsuPrice()

  const { openModal } = useModalState()

  const { userReferrals } = useUserReferrals()

  const handleClick = (referredUsers: ReferredUserDetails[]) => {
    openModal({ name: ModalsKeys.REFERRED_USERS, referredUsers })
  }

  return (
    <>
      <TableRow sx={{ '.MuiTableCell-root': { py: 1 } }}>
        <TableCell>
          <Typography variant='inherit'>
            {userReferrals?.referredUsers || 0}
          </Typography>
        </TableCell>
        <TableCell align='right'>
          <Typography variant='baseSm'>
            {formatAmount(userReferrals?.referralYieldLastEpoch || '0', {
              minDecimals: 2,
            })}{' '}
            KASU
            <br />
            <Typography variant='inherit' color='gray.middle'>
              {formatAmount(
                formatEther(
                  convertToUSD(
                    toBigNumber(userReferrals?.referralYieldLastEpoch || '0'),
                    parseEther(ksuPrice || '0')
                  )
                ),
                {
                  minDecimals: 2,
                }
              )}{' '}
              USDC
            </Typography>
          </Typography>
        </TableCell>
        <TableCell align='right'>
          <Typography variant='baseSm'>
            {formatAmount(userReferrals?.referralYieldLifetime || '0', {
              minDecimals: 2,
            })}{' '}
            KASU
            <br />
            <Typography variant='inherit' color='gray.middle'>
              {formatAmount(
                formatEther(
                  convertToUSD(
                    toBigNumber(userReferrals?.referralYieldLifetime || '0'),
                    parseEther(ksuPrice || '0')
                  )
                ),
                {
                  minDecimals: 2,
                }
              )}{' '}
              USDC
            </Typography>
          </Typography>
        </TableCell>
        <TableCell align='right'>
          <Button
            variant='text'
            sx={{
              ...customTypography.baseSm,
              color: 'gold.dark',
              textTransform: 'capitalize',
              height: 21,
              '.MuiButton-startIcon path': {
                fill: customPalette.gold.dark,
              },
            }}
            startIcon={<PaperIcon />}
            onClick={() =>
              handleClick(userReferrals?.referredUsersDetails ?? [])
            }
          >
            View Details
          </Button>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={4} padding='none'>
          <DottedDivider />
        </TableCell>
      </TableRow>
    </>
  )
}

export default LiteReferralBonusTableBody
