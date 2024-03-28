import { Button, Typography } from '@mui/material'

import useModalState from '@/hooks/context/useModalState'

const DepositDescription = () => {
  const { openModal } = useModalState()

  const handleOpen = () => openModal({ name: 'loyaltyLevelsModal' })

  return (
    <>
      <Typography variant='body2' component='p' textAlign='center'>
        By depositing funds to this Lending Pool, you accept the following{' '}
        <Button
          onClick={handleOpen}
          variant='text'
          sx={{
            display: 'inline',
            height: 'auto',
            p: 0,
            fontSize: 'inherit',
            fontWeight: 'inherit',
            fontFamily: 'inherit',
            textTransform: 'inherit',
          }}
        >
          Terms and Conditions.
        </Button>
      </Typography>
      <Typography variant='subtitle2' component='p' textAlign='center'>
        How do I secure my spot in this tranche?
      </Typography>
      <Typography variant='caption' component='p' letterSpacing='0.4px'>
        Access to higher APY tranches is based on Loyalty Level. In the event of
        oversubscription, applicants will be automatically reassigned to the
        next available tranche. This process repeats for each tranche. Higher
        Loyalty Levels increase the likelihood of allocation to the desired
        tranche, but do not guarantee it.
      </Typography>
    </>
  )
}

export default DepositDescription
