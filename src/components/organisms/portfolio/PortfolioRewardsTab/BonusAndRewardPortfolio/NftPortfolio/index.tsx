'use client'

import {
  Box,
  Button,
  Skeleton,
  Stack,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material'
import Image from 'next/image'
import { Fragment } from 'react'

import useUserNfts from '@/hooks/portfolio/useUserNfts'
import useUserNftYields from '@/hooks/portfolio/useUserNftYields'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

import AuthenticateButton from '@/components/atoms/AuthenticateButton'
import DottedDivider from '@/components/atoms/DottedDivider'
import CustomTable from '@/components/molecules/CustomTable'
import NftPortfolioTableRow from '@/components/organisms/portfolio/PortfolioRewardsTab/BonusAndRewardPortfolio/NftPortfolio/NftPortfolioTableRow'

import NoNftsPlaceholder from '@/images/no_nft_placeholder.png'

const NftPortfolio = () => {
  const { isAuthenticated } = usePrivyAuthenticated()

  const { userNfts, isLoading } = useUserNfts()

  const { userNftYields } = useUserNftYields()

  return (
    <Stack>
      <CustomTable
        tableHeader={
          <TableRow>
            <TableCell width='38%'>NFT</TableCell>
            <TableCell width='18%' align='right'>
              Yield Boost
            </TableCell>
            <TableCell width='22%' align='right'>
              Yield Boost - Last Epoch
            </TableCell>
            <TableCell width='22%' align='right'>
              Yield Boost - Lifetime
            </TableCell>
          </TableRow>
        }
        tableBody={
          !isAuthenticated ? (
            <TableRow>
              <TableCell colSpan={4}>
                <Stack spacing={2} alignItems='center'>
                  <Image
                    src={NoNftsPlaceholder}
                    alt='No Nft placeholder'
                    width={340}
                    height={177}
                  />
                  <Typography variant='h3' color='gold.dark'>
                    Connect your wallet to view your NFTs
                  </Typography>
                  <AuthenticateButton
                    variant='contained'
                    sx={{ textTransform: 'capitalize', width: 176, height: 48 }}
                    onAuthenticated={() => {}}
                  >
                    Connect wallet
                  </AuthenticateButton>
                </Stack>
              </TableCell>
            </TableRow>
          ) : userNfts?.length ? (
            userNfts
              .slice()
              .sort((a, b) => b.boostAmount - a.boostAmount)
              .map((nft, index) => (
                <Fragment key={`${nft.name}-${index}`}>
                  <NftPortfolioTableRow
                    nft={nft}
                    nftYields={userNftYields}
                    isActive={index === 0}
                  />
                  {index !== userNfts.length - 1 && (
                    <TableRow>
                      <TableCell colSpan={4} sx={{ py: 0 }}>
                        <DottedDivider />
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))
          ) : isLoading ? (
            <TableRow
              sx={{
                '.MuiSkeleton-root': {
                  height: 48,
                },
              }}
            >
              <TableCell>
                <Box display='flex' alignItems='center' gap={1}>
                  <Skeleton variant='circular' width={72} height={72} />
                  <Skeleton width='50%' />
                </Box>
              </TableCell>
              <TableCell>
                <Skeleton />
              </TableCell>
              <TableCell>
                <Skeleton />
              </TableCell>
              <TableCell>
                <Skeleton />
              </TableCell>
            </TableRow>
          ) : (
            <TableRow>
              <TableCell colSpan={4}>
                <Stack spacing={2} alignItems='center'>
                  <Image
                    src={NoNftsPlaceholder}
                    alt='No Nft placeholder'
                    width={340}
                    height={177}
                  />
                  <Typography variant='h3' color='gold.dark'>
                    You don’t have Kasu NFTs in your wallet
                  </Typography>
                  <Typography variant='baseMd' color='gray.extraDark'>
                    Buy one to boost your yield!
                  </Typography>
                  <Button
                    variant='contained'
                    href='https://opensea.io/collection/kasu-kings'
                    target='_blank'
                    sx={{ textTransform: 'capitalize', width: 144, height: 48 }}
                  >
                    Go to OpenSea
                  </Button>
                </Stack>
              </TableCell>
            </TableRow>
          )
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
    </Stack>
  )
}

export default NftPortfolio
