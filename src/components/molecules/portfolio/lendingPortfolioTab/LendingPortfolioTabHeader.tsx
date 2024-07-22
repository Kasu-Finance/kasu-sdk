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
            sx={(theme) => ({
              top: 4,
              position: 'relative',
              right: 8,

              [theme.breakpoints.down('sm')]: {
                top: 2,
              },
            })}
          >
            <ButtonGroup
              disableElevation
              variant='contained'
              sx={(theme) => ({
                mr: 2,
                '.MuiButtonGroup-grouped': {
                  borderColor: 'inherit',
                  border: '0px',
                },
                [theme.breakpoints.down('sm')]: {
                  mr: 0,
                },
              })}
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
                  [theme.breakpoints.down('sm')]: {
                    fontSize: 10,
                    width: 48,
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
                  [theme.breakpoints.down('sm')]: {
                    fontSize: 10,
                    width: 48,
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
        titleTypographyProps={{
          sx: (theme) => ({
            [theme.breakpoints.down('sm')]: {
              fontSize: 16,
            },
          }),
        }}
        sx={(theme) => ({
          [theme.breakpoints.down('sm')]: {
            height: 42,
            p: 1,
          },
        })}
      />
    </>
  )
}

export default LendingPortfolioTabHeader
