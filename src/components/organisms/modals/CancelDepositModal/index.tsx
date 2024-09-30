import { Box, Button, Stack, Typography } from '@mui/material'

import useModalState from '@/hooks/context/useModalState'
import useCancelDeposit from '@/hooks/lending/useCancelDeposit'
import useTransactionHistory from '@/hooks/lending/useTransactionHistory'
import useTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import InfoRow from '@/components/atoms/InfoRow'
import ToolTip from '@/components/atoms/ToolTip'
import DialogContent from '@/components/molecules/DialogContent'
import DialogHeader from '@/components/molecules/DialogHeader'
import NextClearingPeriodInfo from '@/components/molecules/NextClearingPeriodInfo'

import { formatAmount, formatTimestamp } from '@/utils'

const CancelDepositModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { t } = useTranslation()

  const { modal } = useModalState()

  const transactionHistory = modal.cancelDepositModal.transactionHistory

  const transactionEvents = transactionHistory.events

  const latestEvent = transactionEvents[transactionEvents.length - 1]

  const formattedTime = formatTimestamp(latestEvent.timestamp, {
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
    <CustomCard>
      <DialogHeader title='Cancel Lending Request' onClose={handleClose} />
      <DialogContent>
        <Stack spacing={3}>
          <Box>
            <InfoRow
              title={t('modals.cancelDeposit.metric-1')}
              toolTipInfo={
                <ToolTip
                  title={t('modals.cancelDeposit.metric-1-tooltip')}
                  iconSx={{
                    color: 'gold.extraDark',
                    '&:hover': {
                      color: 'rgba(133, 87, 38, 1)',
                    },
                  }}
                />
              }
              showDivider
              dividerProps={{
                color: 'white',
              }}
              metric={
                <Typography variant='baseMdBold'>
                  {transactionHistory.lendingPool.name}
                </Typography>
              }
            />
            {transactionHistory.lendingPool.tranches.length > 1 && (
              <InfoRow
                title={t('general.tranche')}
                toolTipInfo={
                  <ToolTip
                    title={t('modals.cancelDeposit.metric-2-tooltip')}
                    iconSx={{
                      color: 'gold.extraDark',
                      '&:hover': {
                        color: 'rgba(133, 87, 38, 1)',
                      },
                    }}
                  />
                }
                showDivider
                dividerProps={{
                  color: 'white',
                }}
                metric={
                  <Typography variant='baseMdBold'>
                    {transactionHistory.trancheName} {t('general.tranche')}
                  </Typography>
                }
              />
            )}
            <InfoRow
              title={t('modals.cancelDeposit.metric-3')}
              toolTipInfo={
                <ToolTip
                  title={t('modals.cancelDeposit.metric-3-tooltip')}
                  iconSx={{
                    color: 'gold.extraDark',
                    '&:hover': {
                      color: 'rgba(133, 87, 38, 1)',
                    },
                  }}
                />
              }
              showDivider
              dividerProps={{
                color: 'white',
              }}
              metric={
                <Typography variant='baseMdBold'>
                  {formatAmount(latestEvent.assetAmount || '0')} USDC
                </Typography>
              }
            />
            <InfoRow
              title={t('modals.cancelDeposit.metric-4')}
              toolTipInfo={
                <ToolTip
                  title={t('modals.cancelDeposit.metric-4-tooltip')}
                  iconSx={{
                    color: 'gold.extraDark',
                    '&:hover': {
                      color: 'rgba(133, 87, 38, 1)',
                    },
                  }}
                />
              }
              showDivider
              dividerProps={{
                color: 'white',
              }}
              metric={
                <Box>
                  <Typography variant='baseMdBold' mr='1ch'>
                    {formattedTime.date}
                  </Typography>
                  <Typography variant='baseMd' color='rgba(133, 87, 38, 1)'>
                    {formattedTime.timestamp} {formattedTime.utcOffset}
                  </Typography>
                </Box>
              }
            />
          </Box>
          <NextClearingPeriodInfo />
          <Button
            color='secondary'
            variant='contained'
            onClick={handleCancel}
            sx={{ textTransform: 'capitalize' }}
          >
            {t('modals.cancelDeposit.cancel-button')}
          </Button>
        </Stack>
      </DialogContent>
    </CustomCard>
  )
}

export default CancelDepositModal
