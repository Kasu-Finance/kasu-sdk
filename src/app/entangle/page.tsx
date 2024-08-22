import {
  Box,
  Container,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material'
import { base64, formatEther } from 'ethers/lib/utils'

import dayjs from '@/dayjs'

enum EntangleAssets {
  PROFITS = 'KASU-PROFITS',
  LOSSES = 'KASU-REAL-LOSSES',
  UNREAL_LOSSES = 'KASU-UNREAL-LOSSES',
}

type EntangleRes = {
  calldata: {
    merkleRoot: string
    signatures: {
      R: string
      S: string
      V: number
    }[]
    feeds: {
      key: EntangleAssets
      value: {
        data: string
        timestamp: EpochTimeStamp
      }
      merkleProofs: string[]
    }[]
  }
  error: string
}

const EntanglePage = async () => {
  const promises = await Promise.all([
    fetch(
      `https://pricefeed.entangle.fi/spotters/integrator-feed?assets=${EntangleAssets.PROFITS}`
    ),

    fetch(
      `https://pricefeed.entangle.fi/spotters/integrator-feed?assets=${EntangleAssets.LOSSES}`
    ),

    fetch(
      `https://pricefeed.entangle.fi/spotters/integrator-feed?assets=${EntangleAssets.UNREAL_LOSSES}`
    ),
  ])

  const result: EntangleRes[] = await Promise.all(
    promises.map((promise) => promise.json())
  )

  return (
    <Container maxWidth='lg'>
      <Box bgcolor='white'>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Asset</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Timestamp</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {result.map((data) => {
              return data.calldata.feeds.map((feed) => (
                <TableRow key={feed.key}>
                  <TableCell>{feed.key}</TableCell>
                  <TableCell>
                    {formatEther(base64.decode(feed.value.data))}
                  </TableCell>
                  <TableCell>
                    {dayjs.unix(feed.value.timestamp).format('DD - MM - YYYY')}
                  </TableCell>
                </TableRow>
              ))
            })}
          </TableBody>
        </Table>
      </Box>
    </Container>
  )
}

export default EntanglePage
