import { Stack, Typography } from '@mui/material'
import Image from 'next/image'

import useTranslation from '@/hooks/useTranslation'

import Cat from '@/images/cat.png'

type EmptyPoolsPlaceholderProps = {
  isActivePool: boolean
}

const EmptyPoolsPlaceholder: React.FC<EmptyPoolsPlaceholderProps> = ({
  isActivePool,
}) => {
  const { t } = useTranslation()

  return (
    <Stack alignItems='center'>
      <Image src={Cat} alt='Cat' />
      <Typography variant='h4'>
        {t(`home.no-data.${isActivePool ? 'activePools' : 'closedPools'}`)}
      </Typography>
    </Stack>
  )
}

export default EmptyPoolsPlaceholder
