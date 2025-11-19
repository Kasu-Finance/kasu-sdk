import { TableCell, TableRow } from '@mui/material'
import React, { Fragment } from 'react'

import { NftDetail } from '@/hooks/portfolio/useUserNfts'
import { UserNftYield } from '@/hooks/portfolio/useUserNftYields'

import DottedDivider from '@/components/atoms/DottedDivider'
import NftRewardsTableRow from '@/components/organisms/lite/NftRewards/NftRewardsTableRow'

type NftRewardsTableBodyProps = {
  userNfts: NftDetail[]
  userNftYields?: UserNftYield
}

const NftRewardsTableBody: React.FC<NftRewardsTableBodyProps> = ({
  userNftYields,
  userNfts,
}) => {
  return userNfts
    .sort((a, b) => b.boostAmount - a.boostAmount)
    .map((nft, index) => (
      <Fragment key={index}>
        <NftRewardsTableRow
          nft={nft}
          nftYields={userNftYields}
          isActive={index === 0}
        />
        <TableRow>
          <TableCell colSpan={4} padding='none'>
            <DottedDivider />
          </TableCell>
        </TableRow>
      </Fragment>
    ))
}

export default NftRewardsTableBody
