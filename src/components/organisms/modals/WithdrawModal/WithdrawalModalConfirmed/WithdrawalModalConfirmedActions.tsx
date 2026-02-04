import { Box, Button } from '@mui/material'

import useModalState from '@/hooks/context/useModalState'
import useWithdrawModalState from '@/hooks/context/useWithdrawModalState'
import getTranslation from '@/hooks/useTranslation'
import { useExplorerUrl } from '@/hooks/web3/useExplorerUrl'

import { ModalsKeys } from '@/context/modal/modal.types'

const WithdrawalModalConfirmedActions = () => {
  const { t } = getTranslation()

  const { getTxUrl } = useExplorerUrl()

  const { txHash } = useWithdrawModalState()

  const { closeModal } = useModalState()

  const handleClose = () => closeModal(ModalsKeys.WITHDRAW)

  return (
    <Box display='flex' gap={4}>
      {txHash && (
        <Button
          variant='outlined'
          color='secondary'
          href={getTxUrl(txHash)}
          target='_blank'
          fullWidth
          sx={{ textTransform: 'capitalize' }}
        >
          {t('modals.lending.completed.viewTx')}
        </Button>
      )}
      <Button
        variant='contained'
        color='secondary'
        fullWidth
        onClick={handleClose}
        sx={{ textTransform: 'capitalize' }}
      >
        {t('general.close')}
      </Button>
    </Box>
  )
}

export default WithdrawalModalConfirmedActions
