import { CardHeader } from '@mui/material'

import CsvDownloadButton from '@/components/atoms/CsvDownloadButton'

const RewardsTabHeader = () => {
  return (
    <CardHeader
      action={
        <CsvDownloadButton
          onDownload={() => alert('Download is not implemented yet.')}
          sx={{
            height: 30,
            width: 169,
            px: 1.5,
            py: 0.5,
            '& .MuiButton-startIcon > svg': {
              width: 18,
            },
          }}
        />
      }
      title='My Rewards Portfolio'
    />
  )
}

export default RewardsTabHeader
