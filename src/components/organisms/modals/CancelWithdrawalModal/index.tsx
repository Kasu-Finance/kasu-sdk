import { Box, Button, Stack, Typography } from '@mui/material'

import useModalState from '@/hooks/context/useModalState'
import useCancelWithdrawal from '@/hooks/lending/useCancelWithdrawal'
import useTransactionHistory from '@/hooks/lending/useTransactionHistory'
import getTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import InfoRow from '@/components/atoms/InfoRow'
import ToolTip from '@/components/atoms/ToolTip'
import DialogContent from '@/components/molecules/DialogContent'
import DialogHeader from '@/components/molecules/DialogHeader'
import EpochEndInfo from '@/components/organisms/modals/CancelWithdrawalModal/EpochEndInfo'

import { formatAmount, formatTimestamp } from '@/utils'

const CancelWithdrawalModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { t } = getTranslation()

  const { modal } = useModalState()

  const { transaction } = modal.cancelWithdrawalModal

  const transactionEvents = transaction.events

  const latestEvent = transactionEvents[transactionEvents.length - 1]

  const formattedTime = formatTimestamp(latestEvent.timestamp, {
    format: 'DD.MM.YYYY HH:mm:ss',
    includeUtcOffset: true,
  })

  const { updateTransactionHistory } = useTransactionHistory()

  const cancelWithdrawal = useCancelWithdrawal()

  const handleCancel = async () => {
    const res = await cancelWithdrawal(
      transaction.lendingPool.id as `0x${string}`,
      transaction.nftId
    )

    if (res?.transactionHash) {
      handleClose()
      await updateTransactionHistory()
    }
  }

  return (
    <CustomCard>
      <DialogHeader
        title={t('modals.cancelWithdrawal.title')}
        onClose={handleClose}
      />
      <DialogContent>
        <Stack spacing={3}>
          <Box>
            <InfoRow
              title={t('modals.cancelWithdrawal.metric-1')}
              toolTipInfo={
                <ToolTip
                  title='info'
                  iconSx={{
                    color: 'gold.extraDark',
                    '&:hover': {
                      color: 'rgba(133, 87, 38, 1)',
                    },
                  }}
                />
              }
              showDivider
              metric={
                <Typography variant='baseMdBold'>
                  {transaction.lendingPool.name}
                </Typography>
              }
            />
            {transaction.lendingPool.tranches.length > 1 && (
              <InfoRow
                title={`${t('general.tranche')} ${t('general.tranche')}`}
                toolTipInfo={
                  <ToolTip
                    title={t('modals.cancelWithdrawal.metric-4-tooltip')}
                    iconSx={{
                      color: 'gold.extraDark',
                      '&:hover': {
                        color: 'rgba(133, 87, 38, 1)',
                      },
                    }}
                  />
                }
                showDivider
                metric={
                  <Typography variant='baseMdBold'>
                    {latestEvent.trancheName}
                  </Typography>
                }
              />
            )}
            <InfoRow
              title={t('modals.cancelWithdrawal.metric-2')}
              toolTipInfo={
                <ToolTip
                  title={t('modals.cancelWithdrawal.metric-2-tooltip')}
                  iconSx={{
                    color: 'gold.extraDark',
                    '&:hover': {
                      color: 'rgba(133, 87, 38, 1)',
                    },
                  }}
                />
              }
              showDivider
              metric={
                <Typography variant='baseMdBold'>
                  {formatAmount(latestEvent.assetAmount, { minDecimals: 2 })}
                </Typography>
              }
            />
            <InfoRow
              title={t('modals.cancelWithdrawal.metric-3')}
              toolTipInfo={
                <ToolTip
                  title={t('modals.cancelWithdrawal.metric-3-tooltip')}
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
          <EpochEndInfo />
          <Button
            variant='contained'
            color='secondary'
            onClick={handleCancel}
            sx={{ textTransform: 'capitalize' }}
          >
            {t('modals.cancelWithdrawal.cancel-button')}
          </Button>
        </Stack>
      </DialogContent>
    </CustomCard>
  )
}

export default CancelWithdrawalModal
