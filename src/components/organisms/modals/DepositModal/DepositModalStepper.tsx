import { Avatar, Box, Stack, Stepper } from '@mui/material'

const DepositModalStepper = () => {
  return (
    <Box
      display='grid'
      gridTemplateColumns='max-content minmax(0,1fr) max-content minmax(0, 1fr) max-content'
    >
      <Stepper></Stepper>
      <Stack>
        <Avatar variant='rounded'>1</Avatar>
      </Stack>
    </Box>
  )
}

export default DepositModalStepper
