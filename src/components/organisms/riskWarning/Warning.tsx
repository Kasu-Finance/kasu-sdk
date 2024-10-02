import { Stack, Typography } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import UnorderedList from '@/components/atoms/UnorderedList'
import Subheading from '@/components/organisms/riskWarning/Subheading'

import { customTypography } from '@/themes/typography'

const Warning = () => {
  const { t } = useTranslation()

  return (
    <Stack spacing={2}>
      <Subheading title={t('modals.riskWarning.subheader-2.title')} />
      <Stack spacing={1}>
        <Typography variant='baseMd'>
          {t('modals.riskWarning.subheader-2.description-1')}
        </Typography>
        <UnorderedList sx={{ ...customTypography.baseMd }}>
          <li>{t('modals.riskWarning.subheader-2.list.list-0')}</li>
          <li>{t('modals.riskWarning.subheader-2.list.list-1')}</li>
        </UnorderedList>
        <Typography variant='baseMd'>
          {t('modals.riskWarning.subheader-2.description-2')}
        </Typography>
        <Typography variant='baseMd'>
          {t('modals.riskWarning.subheader-2.description-3')}
        </Typography>
        <Typography variant='baseMd'>
          {t('modals.riskWarning.subheader-2.description-4')}
        </Typography>
      </Stack>
    </Stack>
  )
}

export default Warning
