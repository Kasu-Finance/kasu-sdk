import { CardHeader } from '@mui/material'

import CsvDownloadButton from '@/components/atoms/CsvDownloadButton'

const RewardsTabHeader = () => {
  return (
    <CardHeader
      action={
        <CsvDownloadButton
          size='small'
          onDownload={() => alert('Download is not implemented yet.')}
          sx={{ top: 4, right: 8 }}
        />
      }
      title='My Rewards Portfolio'
    />
  )
}

export default RewardsTabHeader
