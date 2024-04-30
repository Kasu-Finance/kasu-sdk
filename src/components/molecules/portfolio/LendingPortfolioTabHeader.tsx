import { Button, ButtonGroup, CardHeader } from '@mui/material'

import CsvDownloadButton from '@/components/atoms/CsvDownloadButton'

const LendingPortfolioTabHeader = () => {
  return (
    <CardHeader
      action={
        <>
          <ButtonGroup
            variant='contained'
            sx={(theme) => ({
              height: 30,
              mr: 2,
              '.MuiButton-root': {
                height: 'inherit',
              },
              '.MuiButtonGroup-firstButton': {
                borderColor: theme.palette.success.dark,
              },
              '.MuiButtonGroup-middleButton': {
                borderColor: theme.palette.warning.dark,
              },
            })}
          >
            <Button color='success'>ACTIVE</Button>
            <Button color='warning'>SUSPENDED</Button>
            <Button color='error'>CLOSED</Button>
          </ButtonGroup>
          <CsvDownloadButton
            onDownload={() => alert('Download is not implemented yet.')}
            sx={{
              height: 30,
              width: 169,
              px: 1.5,
              py: 0.5,
              '& .MuiButton-startIcon > svg': {
                width: 18,
              },
            }}
          />
        </>
      }
      title='Lending Portfolio'
    />
  )
}

export default LendingPortfolioTabHeader
