import DownloadIcon from '@mui/icons-material/Download'
import { Button, ButtonProps } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

type CsvDownloadButtonProps = ButtonProps & {
  text?: string
  onDownload: () => void
}

const CsvDownloadButton: React.FC<CsvDownloadButtonProps> = ({
  onDownload,
  text,
  ...rest
}) => {
  const { t } = useTranslation()

  return (
    <>
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
    </>
  )
}

export default CsvDownloadButton
