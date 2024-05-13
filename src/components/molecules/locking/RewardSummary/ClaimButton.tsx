import VerifiedIcon from '@mui/icons-material/Verified'
import { Button, ButtonProps, styled } from '@mui/material'

const StyledClaimButton = styled(Button)(({ theme }) => ({
  display: 'flex',
  marginTop: theme.spacing(2),
  marginLeft: 'auto',
  marginRight: 'auto',
  width: 118,
  '&:not(:disabled) .MuiButton-startIcon > svg > path': {
    fill: 'white',
    fillOpacity: 1,
  },
  '&:disabled .MuiButton-startIcon > svg > path': {
    fillOpacity: 0.26,
  },
}))

const ClaimButton: React.FC<ButtonProps> = (props) => {
  return (
    <StyledClaimButton
      startIcon={<VerifiedIcon />}
      variant='contained'
      {...props}
    />
  )
}

export default ClaimButton
