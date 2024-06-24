import { Box, Button, ButtonGroup, CardHeader } from '@mui/material'
import { Dispatch, SetStateAction } from 'react'

import useTranslation from '@/hooks/useTranslation'

type LendingPortfolioTabHeaderProps = {
  filter: {
    activePools: boolean
    closedPools: boolean
  }
  setFilter: Dispatch<
    SetStateAction<{
      activePools: boolean
      closedPools: boolean
    }>
  >
}

const LendingPortfolioTabHeader: React.FC<LendingPortfolioTabHeaderProps> = ({
  filter,
  setFilter,
}) => {
  const { t } = useTranslation()

  const handleClick = (type: 'activePools' | 'closedPools') => {
    setFilter((prev) => ({ ...prev, [type]: !prev[type] }))
  }
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
                sx={(theme) => ({
                  fontSize: '13px',
                  fontWeight: '400',
                  bgcolor: filter.activePools
                    ? 'rgba(89, 158, 37, 1)'
                    : 'rgba(130, 194, 82, 1)',
                  '&:hover': {
                    bgcolor: theme.palette.success.main,
                  },
                })}
                onClick={() => handleClick('activePools')}
              >
                Active
              </Button>

              <Button
                size='small'
                color='error'
                sx={(theme) => ({
                  fontSize: '13px',
                  fontWeight: '400',
                  bgcolor: filter.closedPools
                    ? theme.palette.error.dark
                    : theme.palette.error.main,
                  '&:hover': {
                    bgcolor: theme.palette.error.light,
                  },
                })}
                onClick={() => handleClick('closedPools')}
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
