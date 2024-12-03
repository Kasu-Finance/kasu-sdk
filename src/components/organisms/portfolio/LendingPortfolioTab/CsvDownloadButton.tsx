'use client'

import { Button } from '@mui/material'
import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'

import useModalState from '@/hooks/context/useModalState'
import useLendingPortfolioData from '@/hooks/portfolio/useLendingPortfolioData'
import getTranslation from '@/hooks/useTranslation'

import { ModalsKeys } from '@/context/modal/modal.types'

import { DownloadRoundedIcon } from '@/assets/icons'

type CsvDownloadButtonProps = {
  poolOverviews: PoolOverview[]
  currentEpoch: string
}

const CsvDownloadButton: React.FC<CsvDownloadButtonProps> = ({
  poolOverviews,
  currentEpoch,
}) => {
  const { t } = getTranslation()

  const { portfolioLendingPools, isLoading } = useLendingPortfolioData(
    poolOverviews,
    currentEpoch
  )

  const { openModal } = useModalState()

  if (isLoading || !portfolioLendingPools?.length) {
    return null
  }

  const handleOpen = () => openModal({ name: ModalsKeys.UNRELEASED_FEATURE })

  return (
    <Button
      variant='text'
      sx={{
        maxWidth: 368,
        mx: 'auto',
        textTransform: 'capitalize',
        height: 'auto',
      }}
      endIcon={<DownloadRoundedIcon />}
      onClick={handleOpen}
    >
      {t('general.csvDownload')}
    </Button>
  )
}

export default CsvDownloadButton
