import DeleteIcon from '@mui/icons-material/Delete'
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  Grid,
  Skeleton,
  Typography,
} from '@mui/material'

import useModalState from '@/hooks/context/useModalState'
import useCancelDeposit from '@/hooks/lending/useCancelDeposit'
import useTransactionHistory from '@/hooks/lending/useTransactionHistory'
import useTranslation from '@/hooks/useTranslation'
import useNextClearingPeriod from '@/hooks/web3/useNextClearingPeriod'

import ColoredBox from '@/components/atoms/ColoredBox'
import Countdown from '@/components/atoms/Countdown'
import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import InfoColumn from '@/components/atoms/InfoColumn'
import TokenAmount from '@/components/atoms/TokenAmount'
import DialogHeader from '@/components/molecules/DialogHeader'

import { DATE_FORMAT, TIME_FORMAT } from '@/constants'
import dayjs from '@/dayjs'
import { formatAmount, formatTimestamp } from '@/utils'

const CancelDepositModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { t } = useTranslation()

  const { modal } = useModalState()

  const transactionHistory = modal.cancelDepositModal.transactionHistory

  const transactionEvents = transactionHistory.events

  const latestEvent = transactionEvents[transactionEvents.length - 1]

  const { nextClearingPeriod, isLoading } = useNextClearingPeriod()

  const formattedTime = formatTimestamp(nextClearingPeriod, {
    format: 'DD.MM.YYYY HH:mm:ss',
    includeUtcOffset: true,
  })

  const { updateTransactionHistory } = useTransactionHistory()
  const cancelDeposit = useCancelDeposit()

  const handleCancel = async () => {
    const res = await cancelDeposit(
      transactionHistory.lendingPool.id as `0x${string}`,
      transactionHistory.nftId
    )

    if (res?.transactionHash) {
      handleClose()
      await updateTransactionHistory()
    }
  }

  return (
    <>
      <DialogHeader title='Cancel Lending Request' onClose={handleClose} />
      <DialogContent>
        <ColoredBox>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <InfoColumn
                title={t('modals.cancelDeposit.metric-1')}
                toolTipInfo={t('modals.cancelDeposit.metric-1-tooltip')}
                showDivider
                metric={
                  <Typography pt='6px' pl={2} variant='h6' component='span'>
                    {transactionHistory.lendingPool.name}
                  </Typography>
                }
              />
              {transactionHistory.lendingPool.tranches.length > 1 && (
                <InfoColumn
                  title={t('general.tranche')}
                  titleStyle={{ textTransform: 'capitalize' }}
                  toolTipInfo={t('modals.cancelDeposit.metric-2-tooltip')}
                  showDivider
                  metric={
                    <Typography pt='6px' pl={2} variant='h6' component='span'>
                      {transactionHistory.trancheName}
                    </Typography>
                  }
                />
              )}
            </Grid>
            <Grid item xs={6}>
              <InfoColumn
                title={t('modals.cancelDeposit.metric-3')}
                toolTipInfo={t('modals.cancelDeposit.metric-3-tooltip')}
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
                title={t('modals.cancelDeposit.metric-4')}
                toolTipInfo={t('modals.cancelDeposit.metric-4-tooltip')}
                showDivider
                metric={
                  <Box pt='6px' pl={2}>
                    <Typography variant='body1' component='span'>
                      {dayjs.unix(latestEvent.timestamp).format(DATE_FORMAT)}
                    </Typography>
                    <br />
                    <Typography variant='caption' component='span'>
                      {dayjs.unix(latestEvent.timestamp).format(TIME_FORMAT)}
                    </Typography>
                  </Box>
                }
              />
            </Grid>
          </Grid>
        </ColoredBox>
        <Box mt={2}>
          <InfoColumn
            title={t('general.nextClearingPeriodStart')}
            showDivider
            metric={
              <Box px={2} py='6px'>
                {isLoading ? (
                  <>
                    <Skeleton variant='rounded' height={28} width={200} />
                    <Skeleton
                      variant='rounded'
                      height={18}
                      width={150}
                      sx={{ mt: 1 }}
                    />
                  </>
                ) : (
                  <>
                    <Typography variant='h6' component='span' display='block'>
                      <Countdown
                        endTime={nextClearingPeriod}
                        format='D:HH:mm'
                        render={(countDown) => {
                          const [days, hours, minutes] = countDown.split(':')
                          return `${days} ${t('time.days')} • ${hours} ${t(
                            'time.hours'
                          )} • ${minutes} ${t('time.minutes')}`
                        }}
                      />
                    </Typography>
                    <Typography variant='body1' color='grey.500'>
                      {formattedTime.date} • {formattedTime.timestamp}{' '}
                      <Typography
                        variant='caption'
                        color='inherit'
                        component='span'
                      >
                        {formattedTime.utcOffset}
                      </Typography>
                    </Typography>
                  </>
                )}
              </Box>
            }
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
        <Button
          variant='contained'
          startIcon={<DeleteIcon />}
          onClick={handleCancel}
        >
          {t('modals.cancelDeposit.cancel-button')}
        </Button>
      </DialogActions>
    </>
  )
}

export default CancelDepositModal
