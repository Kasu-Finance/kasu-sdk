'use client'

import { Button, ButtonProps } from '@mui/material'
import { useState } from 'react'

import { useChain } from '@/hooks/context/useChain'
import useLoadingMaskState from '@/hooks/context/useLoadingMaskState'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

import { downloadFromApi } from '@/utils/downloadFile'

export type CsvKind =
  | 'portfolio-lending'
  | 'transactions-lending-requests'
  | 'transactions-withdrawal-requests'
  | 'rewards'

type ApiCsvDownloadButtonProps = Omit<ButtonProps, 'href' | 'onClick'> & {
  kind: CsvKind
  epochId?: string
  fileBaseName?: string
  children: React.ReactNode
}

const ApiCsvDownloadButton: React.FC<ApiCsvDownloadButtonProps> = ({
  kind,
  epochId,
  fileBaseName = 'kasu',
  disabled,
  children,
  ...buttonProps
}) => {
  const { address } = usePrivyAuthenticated()
  const { currentChainId: chainId } = useChain()
  const { showLoadingMask, hideLoadingMask } = useLoadingMaskState()
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    if (!address || !chainId) return

    setIsDownloading(true)
    showLoadingMask()

    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
      const params = new URLSearchParams({
        kind,
        address: address.toLowerCase(),
        chainId: chainId.toString(),
        timeZone,
        fileBaseName,
      })

      if (epochId) params.set('epochId', epochId)

      await downloadFromApi(`/api/csv?${params.toString()}`)
    } finally {
      setIsDownloading(false)
      hideLoadingMask()
    }
  }

  return (
    <Button
      {...buttonProps}
      type='button'
      disabled={Boolean(disabled || isDownloading)}
      onClick={handleDownload}
    >
      {children}
    </Button>
  )
}

export default ApiCsvDownloadButton
