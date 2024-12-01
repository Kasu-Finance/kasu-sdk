import { Stack, Typography } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

const VariableAndFixedApyTooltip = () => {
  const { t } = getTranslation()

  return (
    <Stack spacing={2}>
      <Typography variant='baseXs'>
        {t('variableAndFixedApy.tooltip-1')}
        <br />
        <br />
        {t('variableAndFixedApy.tooltip-2').replace('{{ epoch }}', '4')}
        <br />
        <br />
        {t('variableAndFixedApy.tooltip-3')}
        <br />
        <br />
        {t('variableAndFixedApy.tooltip-4')}
        <br />
        <br />
        {t('variableAndFixedApy.tooltip-5')}
        <br />
        <br />
        {t('variableAndFixedApy.tooltip-6')}
      </Typography>
    </Stack>
  )
}

export default VariableAndFixedApyTooltip
