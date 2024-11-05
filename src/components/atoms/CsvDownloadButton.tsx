import DownloadIcon from '@mui/icons-material/Download'
import { Button, ButtonProps } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

type CsvDownloadButtonProps = ButtonProps & {
  text?: string
  onDownload: () => void
}

const CsvDownloadButton: React.FC<CsvDownloadButtonProps> = ({
  onDownload,
  text,
  ...rest
}) => {
  const { t } = getTranslation()

  return (
    <Button
      type='button'
      disableElevation
      variant='contained'
      startIcon={<DownloadIcon />}
      onClick={onDownload}
      {...rest}
    >
      {text ?? t('general.csvDownload')}
    </Button>
  )
}

export default CsvDownloadButton
