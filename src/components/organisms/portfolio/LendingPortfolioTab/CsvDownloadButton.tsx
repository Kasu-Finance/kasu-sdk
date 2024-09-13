'use client'

import { Button } from '@mui/material'
import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'

import useLendingPortfolioData from '@/hooks/portfolio/useLendingPortfolioData'
import useTranslation from '@/hooks/useTranslation'

import { DownloadRoundedIcon } from '@/assets/icons'

type CsvDownloadButtonProps = {
  poolOverviews: PoolOverview[]
}

const CsvDownloadButton: React.FC<CsvDownloadButtonProps> = ({
  poolOverviews,
}) => {
  const { t } = useTranslation()

  const { lendingPortfolioData, isLoading } =
    useLendingPortfolioData(poolOverviews)

  if (isLoading || !lendingPortfolioData?.lendingPools.length) {
    return null
  }

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
    >
      {t('general.csvDownload')}
    </Button>
  )
}

export default CsvDownloadButton
