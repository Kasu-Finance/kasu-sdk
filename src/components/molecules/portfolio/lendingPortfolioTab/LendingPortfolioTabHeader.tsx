import { Box, Button, ButtonGroup, CardHeader } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

const LendingPortfolioTabHeader = () => {
  const { t } = useTranslation()
  return (
    <>
      <CardHeader
        action={
          <Box
            sx={{
              top: 4,
              position: 'relative',
              right: 8,
            }}
          >
            <ButtonGroup
              disableElevation
              variant='contained'
              sx={{
                mr: 2,
                '.MuiButtonGroup-grouped': {
                  borderColor: 'inherit',
                  border: '0px',
                },
              }}
            >
              <Button
                size='small'
                color='success'
                sx={{ fontSize: '13px', fontWeight: '400' }}
              >
                Active
              </Button>

              <Button
                size='small'
                color='error'
                sx={{ fontSize: '13px', fontWeight: '400' }}
              >
                Closed
              </Button>
            </ButtonGroup>
            {/* <CsvDownloadButton
              size='small'
              onDownload={() => alert('Download is not implemented yet.')}
            /> */}
          </Box>
        }
        title={t('portfolio.lendingPortfolio.title')}
      />
    </>
  )
}

export default LendingPortfolioTabHeader
