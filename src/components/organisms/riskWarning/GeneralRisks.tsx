import { Stack, Typography } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import UnorderedList from '@/components/atoms/UnorderedList'
import WaveBox from '@/components/atoms/WaveBox'
import Subheading from '@/components/organisms/riskWarning/Subheading'

import { customTypography } from '@/themes/typography'

const GeneralRisks = () => {
  const { t } = getTranslation()

  return (
    <WaveBox px={2} py={3}>
      <Stack spacing={2}>
        <Subheading title={t('modals.riskWarning.subheader-1.title')} />
        <Stack spacing={1}>
          <Typography variant='baseMd'>
            {t('modals.riskWarning.subheader-1.description-1')}
          </Typography>
          <UnorderedList sx={{ ...customTypography.baseMd }}>
            <li>{t('modals.riskWarning.subheader-1.list.list-0')}</li>
            <li>{t('modals.riskWarning.subheader-1.list.list-1')}</li>
            <li>{t('modals.riskWarning.subheader-1.list.list-2')}</li>
          </UnorderedList>
          <Typography variant='baseMd'>
            {t('modals.riskWarning.subheader-1.description-2')}
          </Typography>
        </Stack>
      </Stack>
    </WaveBox>
  )
}

export default GeneralRisks
