'use client'

import {
  Button,
  Skeleton,
  Stack,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material'
import { formatEther, parseEther } from 'ethers/lib/utils'
import { useAccount } from 'wagmi'

import useModalState from '@/hooks/context/useModalState'
import useUserReferrals, {
  ReferredUserDetails,
} from '@/hooks/referrals/useUserReferrals'
import useKsuPrice from '@/hooks/web3/useKsuPrice'

import DottedDivider from '@/components/atoms/DottedDivider'
import CustomTable from '@/components/molecules/CustomTable'

import { ModalsKeys } from '@/context/modal/modal.types'

import { CopyIcon } from '@/assets/icons'

import { customPalette } from '@/themes/palette'
import { customTypography } from '@/themes/typography'
import { convertToUSD, formatAmount, toBigNumber } from '@/utils'

const ReferralBonus = () => {
  const { ksuPrice } = useKsuPrice()

  const { address } = useAccount()

  const { openModal } = useModalState()

  const { userReferrals, isLoading } = useUserReferrals()
  const referralCode = address || ''

  const handleClick = (referredUsers: ReferredUserDetails[]) => {
    openModal({ name: ModalsKeys.REFERRED_USERS, referredUsers })
  }

  const handleCopy = () =>
    navigator.clipboard.writeText(
      `${window.location.origin}/referrals/${referralCode}`
    )

  return (
    <Stack>
      <CustomTable
        tableHeader={
          <TableRow>
            <TableCell width='25%'>Bonus</TableCell>
            <TableCell width='25%' align='right'>
              Successful Referrals
            </TableCell>
            <TableCell width='25%' align='right'>
              Referral Bonus - Last Epoch
            </TableCell>
            <TableCell width='25%' align='right'>
              Referral Bonus - Lifetime
            </TableCell>
          </TableRow>
        }
        tableBody={
          !isLoading && userReferrals ? (
            <TableRow>
              <TableCell>Referral Bonus</TableCell>
              <TableCell align='right'>
                <Typography
                  variant='inherit'
                  onClick={() =>
                    handleClick(userReferrals.referredUsersDetails ?? [])
                  }
                  sx={{ cursor: 'pointer' }}
                >
                  {userReferrals.referredUsers}
                </Typography>
              </TableCell>
              <TableCell align='right'>
                <Typography variant='baseSm'>
                  {formatAmount(userReferrals.referralYieldLastEpoch || '0', {
                    minDecimals: 2,
                  })}{' '}
                  KASU
                  <br />
                  <Typography variant='inherit' color='gray.middle'>
                    {formatAmount(
                      formatEther(
                        convertToUSD(
                          toBigNumber(
                            userReferrals.referralYieldLastEpoch || '0'
                          ),
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
                  {formatAmount(userReferrals.referralYieldLifetime || '0', {
                    minDecimals: 2,
                  })}{' '}
                  KASU
                  <br />
                  <Typography variant='inherit' color='gray.middle'>
                    {formatAmount(
                      formatEther(
                        convertToUSD(
                          toBigNumber(
                            userReferrals.referralYieldLifetime || '0'
                          ),
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
            </TableRow>
          ) : (
            <TableRow>
              <TableCell>
                <Skeleton variant='rounded' height={20} width={150} />
              </TableCell>
              <TableCell align='right'>
                <Skeleton
                  variant='rounded'
                  height={20}
                  width={150}
                  sx={{ ml: 'auto' }}
                />
              </TableCell>
              <TableCell align='right'>
                <Skeleton
                  variant='rounded'
                  height={20}
                  width={150}
                  sx={{ ml: 'auto' }}
                />
              </TableCell>
              <TableCell align='right'>
                <Skeleton
                  variant='rounded'
                  height={20}
                  width={150}
                  sx={{ ml: 'auto' }}
                />
              </TableCell>
            </TableRow>
          )
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
            onClick={handleCopy}
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
