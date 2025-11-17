import { FinancialReportingDocuments } from '@kasufinance/kasu-sdk/src/services/DataService/types'
import {
  IconButton,
  Stack,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material'
import { Fragment } from 'react'

import DottedDivider from '@/components/atoms/DottedDivider'

import { DownloadIcon } from '@/assets/icons'

import dayjs from '@/dayjs'
import { formatAmount, formatTimestamp } from '@/utils'

type FinancialReportingDocumentsTableBodyProps = {
  documents: FinancialReportingDocuments['documents']
}

const FinancialReportingDocumentsTableBody: React.FC<
  FinancialReportingDocumentsTableBodyProps
> = ({ documents }) =>
  documents.map((document) => {
    const formattedTime = formatTimestamp(dayjs(document.date_created).unix(), {
      format: 'DD.MM.YYYY HH:mm:ss',
    })

    return (
      <Fragment key={document.id}>
        <TableRow sx={{ '.MuiTableCell-root': { verticalAlign: 'top' } }}>
          <TableCell>
            <Stack>
              <Typography variant='inherit' fontWeight='bold'>
                {document.name}
              </Typography>
              <Typography variant='inherit' whiteSpace='pre-wrap' mt={1}>
                {document.description}
              </Typography>
            </Stack>
          </TableCell>
          <TableCell>
            <Typography variant='inherit'>{formattedTime.date}</Typography>
            <Typography variant='inherit' color='gray.middle' mt={1}>
              {formattedTime.timestamp}
            </Typography>
          </TableCell>
          <TableCell>
            {formatAmount(document.version, { minDecimals: 2 })}
          </TableCell>
          <TableCell>
            <IconButton sx={{ mt: -0.5 }} href={document.document}>
              <DownloadIcon />
            </IconButton>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell sx={{ py: 0 }} colSpan={4}>
            <DottedDivider />
          </TableCell>
        </TableRow>
      </Fragment>
    )
  })

export default FinancialReportingDocumentsTableBody
