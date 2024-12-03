import { Box, Button } from '@mui/material'
import { useWeb3React } from '@web3-react/core'

import useModalState from '@/hooks/context/useModalState'
import useWithdrawModalState from '@/hooks/context/useWithdrawModalState'
import getTranslation from '@/hooks/useTranslation'

import { ModalsKeys } from '@/context/modal/modal.types'

import { SupportedChainIds } from '@/connection/chains'
import { networks } from '@/connection/networks'

const WithdrawalModalConfirmedActions = () => {
  const { t } = getTranslation()

  const { chainId } = useWeb3React()

  const { txHash } = useWithdrawModalState()

  const { closeModal } = useModalState()

  const handleClose = () => closeModal(ModalsKeys.WITHDRAW)

  return (
    <Box display='flex' gap={4}>
      {txHash && (
        <Button
          variant='outlined'
          color='secondary'
          href={`${
            networks[(chainId as SupportedChainIds) || SupportedChainIds.BASE]
              .blockExplorerUrls[0]
          }/tx/${txHash}`}
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
