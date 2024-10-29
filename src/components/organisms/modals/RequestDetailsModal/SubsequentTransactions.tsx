import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from '@mui/material'

import useModalState from '@/hooks/context/useModalState'
import useTranslation from '@/hooks/useTranslation'

import Countdown from '@/components/atoms/Countdown'

import { ModalsKeys } from '@/context/modal/modal.types'

import { OptInOutIcon } from '@/assets/icons'

import dayjs from '@/dayjs'
import { formatAmount } from '@/utils'

const SubsequentTransactions = () => {
  const { t } = useTranslation()

  const { openModal } = useModalState()

  const handleOpen = () =>
    openModal({
      name: ModalsKeys.BORROWER_IDENTIFIED,
      loanTicket: {} as any,
      pools: [],
    })

  return (
    <>
      <Typography variant='h4'>
        {t('modals.requestDetails.subtitle')}
      </Typography>
      <Box>
        <TableContainer>
          <Table>
            <TableBody
              sx={{
                '.MuiTableCell-root': {
                  px: 0,
                },
              }}
            >
              <TableRow>
                <TableCell>
                  <Typography variant='baseMdBold'>21.01.2024</Typography>
                </TableCell>
                <TableCell>Funds Returned</TableCell>
                <TableCell align='right'>
                  <Typography variant='baseMdBold'>
                    {formatAmount(10_000, { minDecimals: 2 })} USDC
                  </Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography variant='baseMdBold'>21.01.2024</Typography>
                </TableCell>
                <TableCell>
                  <Box display='flex' alignItems='center'>
                    <Button
                      variant='text'
                      sx={{ color: 'white', textTransform: 'capitalize' }}
                      startIcon={<OptInOutIcon />}
                      onClick={handleOpen}
                    >
                      {t('general.optInOut')}
                    </Button>
                    Time left:{' '}
                    <Countdown
                      endTime={dayjs().add(2, 'days').unix()}
                      format='HH:mm:ss'
                      render={(countDown) => {
                        const [hours, minutes, seconds] = countDown.split(':')

                        return `${hours} hrs, ${minutes} mins, ${seconds} secs.`
                      }}
                    />
                  </Box>
                </TableCell>
                <TableCell align='right'>
                  <Typography variant='baseMdBold'>
                    {formatAmount(1_000, { minDecimals: 2 })} USDC
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </>
  )
}

export default SubsequentTransactions
