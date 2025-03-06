'use client'

import { Button, Stack, Typography } from '@mui/material'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

import CustomCard from '@/components/atoms/CustomCard'
import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import WaveBox from '@/components/atoms/WaveBox'
import DialogHeader from '@/components/molecules/DialogHeader'

const WipRedirectModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const pathname = usePathname()

  const router = useRouter()

  const handleBack = router.back

  useEffect(() => {
    if (pathname !== '/locking') {
      handleClose()
    }
  }, [pathname, handleClose])

  return (
    <CustomCard>
      <DialogHeader title='Coming Soon' onClose={handleBack} />
      <WaveBox variant='gold' px={2} py={3} borderRadius={2}>
        <Stack alignItems='center' spacing={3}>
          <Typography variant='baseMd' textAlign='center' px={3}>
            We’re working hard on the launch of the $KASU token. In the
            meantime, start lending so you’re the first to benefit once $KASU
            launches.
          </Typography>
          <Button
            variant='contained'
            color='dark'
            sx={{ maxWidth: 180, textTransform: 'capitalize' }}
            fullWidth
            onClick={handleBack}
          >
            Go Back
          </Button>
        </Stack>
      </WaveBox>
    </CustomCard>
  )
}

export default WipRedirectModal
