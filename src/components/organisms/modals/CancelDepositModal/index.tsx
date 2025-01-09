import { Box, Button, Stack, Typography } from '@mui/material'

import useModalState from '@/hooks/context/useModalState'
import useCancelDeposit from '@/hooks/lending/useCancelDeposit'
import useTransactionHistory from '@/hooks/lending/useTransactionHistory'
import getTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import InfoRow from '@/components/atoms/InfoRow'
import ToolTip from '@/components/atoms/ToolTip'
import DialogContent from '@/components/molecules/DialogContent'
import DialogHeader from '@/components/molecules/DialogHeader'
import NextClearingPeriodInfo from '@/components/molecules/NextClearingPeriodInfo'
import GrossApyTooltip from '@/components/molecules/tooltips/GrossApyTooltip'
import VariableAndFixedApyTooltip from '@/components/molecules/tooltips/VariableAndFixedApyTooltip'

import { ModalsKeys } from '@/context/modal/modal.types'

import { formatAmount, formatPercentage, formatTimestamp } from '@/utils'

const CancelDepositModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { t } = getTranslation()

  const { modal } = useModalState()

  const { transaction, currentEpoch } = modal[ModalsKeys.CANCEL_DEPOSIT]

  const formattedTime = formatTimestamp(transaction.timestamp, {
    format: 'DD.MM.YYYY HH:mm:ss',
    includeUtcOffset: true,
  })

  const { updateTransactionHistory } = useTransactionHistory(currentEpoch)
  const cancelDeposit = useCancelDeposit()

  const handleCancel = async () => {
    const res = await cancelDeposit(
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
                  {transaction.lendingPool.name}
                </Typography>
              }
            />
            {transaction.lendingPool.tranches.length > 1 && (
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
                    {transaction.trancheName} {t('general.tranche')}
                  </Typography>
                }
              />
            )}

            <InfoRow
              title={t('general.grossApy')}
              toolTipInfo={
                <ToolTip
                  title={<GrossApyTooltip />}
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
                <Box display='flex' alignItems='center'>
                  <Typography variant='baseMdBold'>
                    {transaction.fixedTermConfig ? 'Fixed APY' : 'Variable APY'}
                  </Typography>
                  <ToolTip
                    title={<VariableAndFixedApyTooltip />}
                    iconSx={{
                      color: 'gold.extraDark',
                      '&:hover': {
                        color: 'rgba(133, 87, 38, 1)',
                      },
                    }}
                  />
                  <Typography variant='baseMdBold' ml='0.5ch'>
                    {formatPercentage(
                      transaction.fixedTermConfig
                        ? transaction.fixedTermConfig.apy
                        : transaction.apy
                    )}
                  </Typography>
                </Box>
              }
            />
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
                  {formatAmount(transaction.amount || '0')} USDC
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
          <NextClearingPeriodInfo
            beforeText={t('modals.cancelDeposit.nextClearingText')}
          />
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
