'use client'

import {
  Box,
  Button,
  Stack,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material'
import { formatEther, parseEther } from 'ethers/lib/utils'

import DottedDivider from '@/components/atoms/DottedDivider'
import CustomTable from '@/components/molecules/CustomTable'

import { CopyIcon, WithdrawMoneyIcon } from '@/assets/icons'

import { customPalette } from '@/themes/palette'
import { customTypography } from '@/themes/typography'
import { formatAmount } from '@/utils'

//TODO-HENG: Implement logic to table row
const NftPortfolio = () => {
  const isHighestNFTTier = false

  return (
    <Stack>
      <CustomTable
        tableHeader={
          <TableRow>
            <TableCell width='25%'>NFT</TableCell>
            <TableCell width='15%' align='right'>
              Yield Boost
            </TableCell>
            <TableCell width='19%' align='right'>
              Yield Boost - Last Epoch
            </TableCell>
            <TableCell width='19%' align='right'>
              Yield Boost - Lifetime
            </TableCell>
            <TableCell width='14%' align='right'>
              Claimable Balance
            </TableCell>
            <TableCell width='8%' align='right'>
              Action
            </TableCell>
          </TableRow>
        }
        tableBody={
          <>
            <TableRow>
              <TableCell>
                <Box display='flex' alignItems='center' gap={1}>
                  <Box
                    component='img'
                    src='https://fastly.picsum.photos/id/288/200/300.jpg?hmac=45WLionXnoogi0-njKuSNnVY5hnswMhf-CrxwzKTcrc'
                    alt='NFT'
                    sx={{
                      width: 72,
                      height: 72,
                      borderRadius: '50%',
                      border: `0.5rem solid ${customPalette.gold.dark}`,
                    }}
                  />
                  Name of the NFT
                </Box>
              </TableCell>
              <TableCell align='right'>
                <Box display='flex' justifyContent='flex-end'>
                  <Typography variant='baseSm'>
                    10.00% APY
                    <br />
                    <Typography variant='inherit' color='gray.middle'>
                      Boost applied to interest earnings
                    </Typography>
                  </Typography>
                </Box>
              </TableCell>
              <TableCell align='right'>
                <Typography variant='baseSm'>
                  {formatAmount(160, { minDecimals: 2 })} KASU
                  <br />
                  <Typography variant='inherit' color='gray.middle'>
                    {formatAmount(formatEther(parseEther('160')), {
                      minDecimals: 2,
                    })}{' '}
                    USDC
                  </Typography>
                </Typography>
              </TableCell>
              <TableCell align='right'>
                {formatAmount(160, { minDecimals: 2 })} KASU
              </TableCell>
              <TableCell align='right'>
                <Typography variant='baseSm'>
                  {formatAmount(160, { minDecimals: 2 })} KASU
                  <br />
                  <Typography variant='inherit' color='gray.middle'>
                    {formatAmount(formatEther(parseEther('160')), {
                      minDecimals: 2,
                    })}{' '}
                    USDC
                  </Typography>
                </Typography>
              </TableCell>
              <TableCell align='right'>
                <Box
                  display='flex'
                  alignItems='center'
                  gap={1}
                  justifyContent='flex-end'
                >
                  <WithdrawMoneyIcon />
                  <Typography variant='baseSm' color='primary.main'>
                    Claim
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
            <TableRow
              sx={{
                opacity: !isHighestNFTTier ? 0.5 : 1,
                pointerEvents: !isHighestNFTTier ? 'none' : 'auto',
                backgroundColor: !isHighestNFTTier
                  ? 'rgba(0, 0, 0, 0.04)'
                  : 'inherit',
                '& td': {
                  color: !isHighestNFTTier ? 'text.disabled' : 'inherit',
                },
              }}
            >
              <TableCell>
                <Box display='flex' alignItems='center' gap={1}>
                  <Box
                    component='img'
                    src='https://fastly.picsum.photos/id/288/200/300.jpg?hmac=45WLionXnoogi0-njKuSNnVY5hnswMhf-CrxwzKTcrc'
                    alt='NFT'
                    sx={{
                      width: 72,
                      height: 72,
                      borderRadius: '50%',
                      border: `0.5rem solid ${isHighestNFTTier ? customPalette.gold.dark : customPalette.gold.light}`,
                      opacity: !isHighestNFTTier ? 0.5 : 1,
                    }}
                  />
                  Name of the NFT
                </Box>
              </TableCell>
              <TableCell align='right'>
                <Box display='flex' justifyContent='flex-end'>
                  <Typography variant='baseSm'>
                    10.00% APY
                    <br />
                    <Typography variant='inherit' color='gray.middle'>
                      Boost applied to interest earnings
                    </Typography>
                  </Typography>
                </Box>
              </TableCell>
              {!isHighestNFTTier ? (
                <TableCell colSpan={4}>
                  <Box display='flex' justifyContent='center'>
                    Inactive - only the highest APY Boost NFT applies to all
                    your lending
                  </Box>
                </TableCell>
              ) : (
                <>
                  <TableCell align='right'>
                    <Typography variant='baseSm'>
                      {formatAmount(160, { minDecimals: 2 })} KASU
                      <br />
                      <Typography variant='inherit' color='gray.middle'>
                        {formatAmount(formatEther(parseEther('160')), {
                          minDecimals: 2,
                        })}{' '}
                        USDC
                      </Typography>
                    </Typography>
                  </TableCell>
                  <TableCell align='right'>
                    {formatAmount(160, { minDecimals: 2 })} KASU
                  </TableCell>
                  <TableCell align='right'>
                    <Typography variant='baseSm'>
                      {formatAmount(160, { minDecimals: 2 })} KASU
                      <br />
                      <Typography variant='inherit' color='gray.middle'>
                        {formatAmount(formatEther(parseEther('160')), {
                          minDecimals: 2,
                        })}{' '}
                        USDC
                      </Typography>
                    </Typography>
                  </TableCell>
                  <TableCell align='right'>
                    <Box
                      display='flex'
                      alignItems='center'
                      gap={1}
                      justifyContent='flex-end'
                    >
                      <WithdrawMoneyIcon />
                      <Typography variant='baseSm' color='primary.main'>
                        Claim
                      </Typography>
                    </Box>
                  </TableCell>
                </>
              )}
            </TableRow>
          </>
        }
        sx={{
          bgcolor: 'white',
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          boxShadow: 'none',
          '& .MuiPaper-root': {
            boxShadow: 'none',
          },
        }}
        tableSx={{
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          boxShadow: 'none',
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

export default NftPortfolio
