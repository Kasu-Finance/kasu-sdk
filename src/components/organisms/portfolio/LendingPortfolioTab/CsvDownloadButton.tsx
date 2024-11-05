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
}

const CsvDownloadButton: React.FC<CsvDownloadButtonProps> = ({
  poolOverviews,
}) => {
  const { t } = getTranslation()

  const { lendingPortfolioData, isLoading } =
    useLendingPortfolioData(poolOverviews)

  const { openModal } = useModalState()

  if (isLoading || !lendingPortfolioData?.lendingPools.length) {
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
