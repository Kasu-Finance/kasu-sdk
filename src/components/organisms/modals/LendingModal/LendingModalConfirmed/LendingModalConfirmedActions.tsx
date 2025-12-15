import { Box, Button } from '@mui/material'
import { useEffect, useRef } from 'react'
import { useSWRConfig } from 'swr'
import { useChainId } from 'wagmi'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useLiteModeState from '@/hooks/context/useLiteModeState'
import useModalState from '@/hooks/context/useModalState'
import getTranslation from '@/hooks/useTranslation'

import { ModalsKeys } from '@/context/modal/modal.types'

import { SupportedChainIds } from '@/connection/chains'
import { networks } from '@/connection/networks'

const LendingModalConfirmedActions = () => {
  const { t } = getTranslation()

  const { isLiteMode } = useLiteModeState()

  const chainId = useChainId()

  const { txHash } = useDepositModalState()

  const { mutate } = useSWRConfig()
  const hasRevalidatedRef = useRef(false)

  const { closeModal } = useModalState()

  useEffect(() => {
    if (!txHash) return
    if (hasRevalidatedRef.current) return
    hasRevalidatedRef.current = true

    void mutate(() => true, undefined, { revalidate: true })
  }, [mutate, txHash])

  const handleClose = () => closeModal(ModalsKeys.LEND)

  return (
    <Box display='flex' gap={4}>
      {!isLiteMode && txHash && (
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

export default LendingModalConfirmedActions
