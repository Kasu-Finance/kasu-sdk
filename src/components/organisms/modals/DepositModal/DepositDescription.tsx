import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
} from '@mui/material'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useModalState from '@/hooks/context/useModalState'

const DepositDescription = () => {
  const { openModal } = useModalState()
  const { setTermsAccepted, termsAccepted } = useDepositModalState()
  const handleOpen = () => openModal({ name: 'loyaltyLevelsModal' })

  const handleCheckboxChange = (event) => {
    setTermsAccepted(event.target.checked)
  }

  return (
    <Box display='flex' flexDirection='column' pl={2}>
      <Box
        display='flex'
        alignItems='center'
        justifyContent='center'
        flexWrap='wrap'
        mb={1}
      >
        <FormControlLabel
          control={
            <Checkbox checked={termsAccepted} onChange={handleCheckboxChange} />
          }
          label={
            <Typography variant='body2' component='span'>
              By depositing funds to this Lending Pool, you accept the following{' '}
            </Typography>
          }
        />
        <Button
          onClick={handleOpen}
          variant='text'
          sx={{
            display: 'inline',
            height: 'auto',
            p: 0,
            mt: -1,
            fontSize: 'inherit',
            fontWeight: 'inherit',
            fontFamily: 'inherit',
            textTransform: 'inherit',
          }}
        >
          Terms and Conditions.
        </Button>
      </Box>

      <Typography variant='subtitle2' component='p' textAlign='center' mb={2}>
        How do I secure my spot in this tranche?
      </Typography>
      <Typography
        variant='caption'
        component='p'
        letterSpacing='0.4px'
        textAlign='center'
      >
        Access to higher APY tranches is based on Loyalty Level. In the event of
        oversubscription, applicants will be automatically reassigned to the
        next available tranche. This process repeats for each tranche. Higher
        Loyalty Levels increase the likelihood of allocation to the desired
        tranche, but do not guarantee it.
      </Typography>
    </Box>
  )
}

export default DepositDescription
