import { Box, TableCell, TableRow, Typography } from '@mui/material'
import { formatEther, formatUnits, parseEther } from 'ethers/lib/utils'
import Image from 'next/image'

import { NftDetail } from '@/hooks/portfolio/useUserNfts'
import { UserNftYield } from '@/hooks/portfolio/useUserNftYields'
import useKsuPrice from '@/hooks/web3/useKsuPrice'

import { customPalette } from '@/themes/palette'
import { convertToUSD, formatAmount, toBigNumber } from '@/utils'

type NftPortfolioTableRowProps = {
  nft: NftDetail
  nftYields?: UserNftYield
  isActive: boolean
}

const NftPortfolioTableRow: React.FC<NftPortfolioTableRowProps> = ({
  nft,
  nftYields,
  isActive,
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
          color: !isActive ? 'gray.light' : 'inherit',
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
            variant='baseMd'
            color={isActive ? 'gray.extraDark' : 'gray.light'}
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
              variant='inherit'
              color={isActive ? 'gray.middle' : 'gray.light'}
            >
              Boost applied to interest earnings
            </Typography>
          </Typography>
        </Box>
      </TableCell>
      {isActive && nftYields ? (
        <>
          <TableCell align='right'>
            <Typography variant='baseSm'>
              {formatAmount(formatUnits(nftYields.epochBoost, 6), {
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
            {formatAmount(formatUnits(nftYields.totalBoost, 6), {
              minDecimals: 2,
            })}{' '}
            KASU
          </TableCell>
        </>
      ) : (
        <TableCell colSpan={3}>
          <Box display='flex' justifyContent='center'>
            Inactive - only the highest APY Boost NFT applies to all your
            lending
          </Box>
        </TableCell>
      )}
    </TableRow>
  )
}

export default NftPortfolioTableRow
