import { CardHeader } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import CsvDownloadButton from '@/components/atoms/CsvDownloadButton'

const RewardsTabHeader = () => {
  const { t } = useTranslation()

  return (
    <CardHeader
      action={
        <CsvDownloadButton
          size='small'
          onDownload={() => alert('Download is not implemented yet.')}
          sx={{ top: 4, right: 8 }}
        />
      }
      title={t('portfolio.rewards.title')}
    />
  )
}

export default RewardsTabHeader
