import { Stack, Typography } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

const ApyStructureTooltip = () => {
  const { t } = getTranslation()

  return (
    <Stack spacing={2}>
      <Typography variant='baseXs'>
        {t('apyStructure.tooltip-1')}
        <br />
        <br />
        {t('apyStructure.tooltip-2')}
      </Typography>
    </Stack>
  )
}

export default ApyStructureTooltip
