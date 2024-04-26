import DeleteIcon from '@mui/icons-material/Delete'
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  Grid,
  Typography,
} from '@mui/material'

import useModalState from '@/hooks/context/useModalState'
import useCancelWithdrawal from '@/hooks/lending/useCancelWithdrawal'
import useNextEpochTime from '@/hooks/locking/useNextEpochTime'
import useTranslation from '@/hooks/useTranslation'

import ColoredBox from '@/components/atoms/ColoredBox'
import Countdown from '@/components/atoms/Countdown'
import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import InfoColumn from '@/components/atoms/InfoColumn'
import TokenAmount from '@/components/atoms/TokenAmount'
import DialogHeader from '@/components/molecules/DialogHeader'

import dayjs from '@/dayjs'
import { formatAmount } from '@/utils'

const CancelWithdrawalModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { t } = useTranslation()

  const { modal } = useModalState()

  const transactionHistory = modal.cancelWithdrawalModal.transactionHistory

  const transactionEvents = transactionHistory.events

  const latestEvent = transactionEvents[transactionEvents.length - 1]

  const { nextEpochTime } = useNextEpochTime()

  const cancelWithdrawal = useCancelWithdrawal()

  return (
    <>
      <DialogHeader title='Cancel Withdrawal Request' onClose={handleClose} />
      <DialogContent>
        <ColoredBox>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <InfoColumn
                title='From Pool'
                toolTipInfo='info'
                showDivider
                metric={
                  <Typography pt='6px' pl={2} variant='h6' component='span'>
                    {transactionHistory.lendingPoolName}
                  </Typography>
                }
              />
            </Grid>
            <Grid item xs={6}>
              <InfoColumn
                title='Withdrawal Request Amount'
                toolTipInfo='info'
                showDivider
                metric={
                  <TokenAmount
                    pt='6px'
                    pl={2}
                    amount={formatAmount(latestEvent.assetAmount || '0')}
                    symbol='USDC'
                    mb='10px'
                  />
                }
              />
              <InfoColumn
                title='Withdrawal Request Date'
                toolTipInfo='info'
                showDivider
                metric={
                  <Box pt='6px' pl={2}>
                    <Typography variant='body1' component='span'>
                      {dayjs.unix(latestEvent.timestamp).format('DD.MM.YYYY')}
                    </Typography>
                    <br />
                    <Typography variant='caption' component='span'>
                      {dayjs
                        .unix(latestEvent.timestamp)
                        .format('HH:mm:ss UTCZZ')}
                    </Typography>
                  </Box>
                }
              />
            </Grid>
          </Grid>
        </ColoredBox>
        <Box mt={2}>
          <InfoColumn
            title='Epoch Ends in'
            showDivider
            metric={
              <Box px={2} py='6px'>
                <Typography variant='h6' component='span' display='block'>
                  <Countdown
                    endTime={nextEpochTime ?? 0}
                    format='D:HH:mm'
                    render={(countDown) => {
                      const parts = countDown.split(':')

                      return `${parts[0]} ${t('time.days')} • ${parts[1]} ${t(
                        'time.hours'
                      )} • ${parts[2]} ${t('time.minutes')}`
                    }}
                  />
                </Typography>
                <Typography
                  variant='body1'
                  component='span'
                  color={(theme) => theme.palette.text.secondary}
                >
                  {dayjs
                    .unix(nextEpochTime ?? 0)
                    .format('DD.MM.YYYY • HH:mm:ss UTCZZ')}
                </Typography>
              </Box>
            }
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
        <Button
          variant='contained'
          startIcon={<DeleteIcon />}
          onClick={() =>
            cancelWithdrawal(
              transactionHistory.lendingPoolId as `0x${string}`,
              transactionHistory.nftId
            )
          }
        >
          Cancel Withdrawal Request
        </Button>
      </DialogActions>
    </>
  )
}

export default CancelWithdrawalModal
