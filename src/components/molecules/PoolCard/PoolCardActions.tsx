import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import LoginIcon from '@mui/icons-material/Login'
import { Box, Button } from '@mui/material'
import Link from 'next/link'

import useTranslation from '@/hooks/useTranslation'

import KycButton from '@/components/atoms/KycButton'

interface PoolCardActionsProps {
  link: string
}

const PoolCardActions: React.FC<PoolCardActionsProps> = ({ link }) => {
  const { t } = useTranslation()
  return (
    <Box display='flex' justifyContent='center' mt={3} mb={2}>
      <KycButton
        variant='contained'
        sx={{ pl: 2.25, pr: 2.25 }}
        startIcon={<LoginIcon />}
        onClick={() => {}}
      >
        {t('general.deposit')}
      </KycButton>
      <Button
        sx={{ ml: 2 }}
        href={link}
        component={Link}
        variant='contained'
        startIcon={<ArrowForwardIcon />}
      >
        {t('general.overview')}
      </Button>
    </Box>
  )
}

export default PoolCardActions
