import { Stack, Typography } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import UnlockModalEditActions from '@/components/organisms/modals/UnlockModal/UnlockModalEdit/UnlockModalEditActions'
import UnlockModalInput from '@/components/organisms/modals/UnlockModal/UnlockModalEdit/UnlockModalInput'
import UnlockModalOverview from '@/components/organisms/modals/UnlockModal/UnlockModalEdit/UnlockModalOverview'
import UnlockRemainingInfo from '@/components/organisms/modals/UnlockModal/UnlockModalEdit/UnlockRemainingInfo'

const UnlockModalEdit = () => {
  const { t } = useTranslation()

  return (
    <Stack spacing={3} mt={3}>
      <UnlockModalOverview />
      <Typography variant='h5'>
        {t('modals.unlock.withdraw.withdraw-title')}
      </Typography>
      <UnlockRemainingInfo />
      <UnlockModalInput />
      <UnlockModalEditActions />
    </Stack>
  )
}

export default UnlockModalEdit
