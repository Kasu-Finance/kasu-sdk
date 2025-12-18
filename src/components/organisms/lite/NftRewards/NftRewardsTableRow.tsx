import { Box, TableCell, TableRow, Typography } from '@mui/material'
import { formatEther, formatUnits, parseEther } from 'ethers/lib/utils'
import Image from 'next/image'
import React from 'react'

import { NftDetail } from '@/hooks/portfolio/useUserNfts'
import { UserNftYield } from '@/hooks/portfolio/useUserNftYields'
import useKsuPrice from '@/hooks/web3/useKsuPrice'

import { customPalette } from '@/themes/palette'
import { convertToUSD, formatAmount, toBigNumber } from '@/utils'

type NftRewardsTableRowProps = {
  nft: NftDetail
  nftYields?: UserNftYield
  isActive: boolean
}

const NftRewardsTableRow: React.FC<NftRewardsTableRowProps> = ({
  isActive,
  nft,
  nftYields,
}) => {
  const { ksuPrice } = useKsuPrice()

  const epochBoostUSD = convertToUSD(
    toBigNumber(formatUnits(nftYields?.epochBoost || '0', 6)),
    parseEther(ksuPrice || '0')
  )

  return (
    <TableRow
      sx={{
        '.MuiTableCell-root': {
          color: !isActive ? 'rgb(102 102 102)' : 'white',
          py: 1,
        },
      }}
    >
      <TableCell>
        <Box display='flex' alignItems='center' gap={1}>
          <Image
            width={72}
            height={72}
            style={{
              borderRadius: '50%',
              border: `8px solid ${isActive ? customPalette.gold.dark : '#D9D6D2'}`,
              opacity: isActive ? 1 : 0.6,
            }}
            src={nft.image}
            alt={nft.name}
          />
          <Typography
            variant='baseSm'
            color={isActive ? 'white' : 'rgb(102 102 102)'}
          >
            {nft.name ?? 'NFT'}
          </Typography>
        </Box>
      </TableCell>
      <TableCell align='right'>
        <Box display='flex' justifyContent='flex-end'>
          <Typography variant='baseSm'>
            {formatAmount(nft.boostAmount, { minDecimals: 2 })}% APY
            <br />
            <Typography
              variant='baseXs'
              color={isActive ? 'gray.middle' : 'rgb(102 102 102)'}
            >
              Boost applied to interest earnings
            </Typography>
          </Typography>
        </Box>
      </TableCell>
      {isActive ? (
        <>
          <TableCell align='right'>
            <Typography variant='baseSm'>
              {formatAmount(formatUnits(nftYields?.epochBoost || '0', 6), {
                minDecimals: 2,
              })}{' '}
              KASU
              <br />
              <Typography variant='inherit' color='gray.middle'>
                {formatAmount(formatEther(epochBoostUSD), {
                  minDecimals: 2,
                })}{' '}
                USDC
              </Typography>
            </Typography>
          </TableCell>
          <TableCell align='right'>
            {formatAmount(formatUnits(nftYields?.totalBoost || '0', 6), {
              minDecimals: 2,
            })}{' '}
            KASU
          </TableCell>
        </>
      ) : (
        <TableCell colSpan={3}>
          <Box display='flex' justifyContent='center'>
            <Typography variant='baseXs'>
              Inactive - only the highest APY Boost NFT applies to all your
              lending
            </Typography>
          </Box>
        </TableCell>
      )}
    </TableRow>
  )
}

export default NftRewardsTableRow
