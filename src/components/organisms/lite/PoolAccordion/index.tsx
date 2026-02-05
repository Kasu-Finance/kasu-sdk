'use client'

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Stack,
  Typography,
} from '@mui/material'
import React, { Fragment, useState } from 'react'
import ReactMarkdown from 'react-markdown'

import getTranslation from '@/hooks/useTranslation'

import DottedDivider from '@/components/atoms/DottedDivider'
import LendButton from '@/components/atoms/LendButton'
import ProgressBar from '@/components/atoms/ProgressBar'
import ToolTip from '@/components/atoms/ToolTip'
import LiteTrancheTooltip from '@/components/molecules/tooltips/Lite/LiteTrancheTooltip'

import { formatPercentage } from '@/utils'

import { PoolOverviewWithDelegate } from '@/types/page'

type PoolAccordionProps = {
  pools: PoolOverviewWithDelegate[]
  currentEpoch: string
  enabled?: boolean
}

const PoolAccordion: React.FC<PoolAccordionProps> = ({
  pools,
  currentEpoch,
  enabled = true,
}) => {
  const { t } = getTranslation()

  const [expanded, setExpanded] = useState<string | false>(
    pools[0]?.id ?? false
  )

  // Don't render anything if no pools
  if (!pools.length) return null

  const handleChange =
    (panel: string) => (_: React.SyntheticEvent, newExpanded: boolean) => {
      setExpanded(newExpanded ? panel : false)
    }
  return (
    <Box>
      {pools.map((pool) => (
        <Fragment key={pool.id}>
          <Accordion
            expanded={pool.id === expanded}
            onChange={handleChange(pool.id)}
            sx={{
              bgcolor: 'transparent',
              '&::before': {
                display: 'none',
              },
            }}
            elevation={0}
          >
            <AccordionSummary
              aria-controls={`${pool.poolName} content`}
              id={pool.id}
              sx={{
                flexDirection: 'row-reverse',
                gap: 1,
                p: 0,
              }}
            >
              <Stack>
                <Box display='flex' alignItems='center' gap={1}>
                  <svg
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      d='M12 0C18.6274 0 24 5.37258 24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12C0 5.37258 5.37258 0 12 0ZM12.7715 12.9355C12.3715 12.4506 11.6285 12.4506 11.2285 12.9355L9.01953 15.6133C8.48157 16.2655 8.94555 17.25 9.79102 17.25H14.209C15.0545 17.25 15.5184 16.2655 14.9805 15.6133L12.7715 12.9355ZM9.79102 6.75C8.94555 6.75 8.48157 7.73448 9.01953 8.38672L11.2285 11.0645C11.6285 11.5494 12.3715 11.5494 12.7715 11.0645L14.9805 8.38672C15.5184 7.73448 15.0545 6.75 14.209 6.75H9.79102Z'
                      fill='#C9A279'
                    />
                  </svg>
                  <Typography variant='h5' color='gold.dark'>
                    {pool.poolName}
                  </Typography>
                </Box>
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ color: 'white', px: 0 }}>
              <Stack spacing={3}>
                <Typography variant='baseSm'>
                  <ReactMarkdown>{pool.liteDescription}</ReactMarkdown>
                </Typography>
                <Stack spacing={1.5}>
                  {pool.tranches.map((tranche) => (
                    <Stack key={tranche.id}>
                      <Box
                        display='flex'
                        alignItems='center'
                        justifyContent='space-between'
                      >
                        <Typography variant='baseSm'>
                          {tranche.name} {t('general.tranche')}
                        </Typography>
                        <Box display='flex' alignItems='center'>
                          <Typography variant='h4'>
                            {formatPercentage(tranche.apy)} {t('general.apy')}
                          </Typography>
                          <ToolTip
                            title={<LiteTrancheTooltip />}
                            iconSx={{
                              color: 'gold.dark',
                              '&:hover': {
                                color: 'gold.extraDark',
                              },
                            }}
                          />
                        </Box>
                      </Box>
                      <ProgressBar
                        value={
                          (1 - parseFloat(tranche.poolCapacityPercentage)) * 100
                        }
                        barStyles={{
                          height: 16,
                          '&.progress-background': {
                            backgroundColor: 'gray.dark',
                          },
                          '&.progress-foreground': {
                            borderRadius: 40,
                          },
                        }}
                        rootStyles={{
                          height: 16,
                          borderRadius: 30,
                        }}
                      >
                        <Typography variant='baseXs' width='100%' px={1}>
                          {formatPercentage(
                            1 - parseFloat(tranche.poolCapacityPercentage),
                            0
                          )}{' '}
                          FULL
                        </Typography>
                      </ProgressBar>
                    </Stack>
                  ))}
                </Stack>
                <LendButton
                  pools={pools}
                  pool={pool}
                  currentEpoch={currentEpoch}
                  enabled={enabled}
                >
                  Lend Now
                </LendButton>
              </Stack>
            </AccordionDetails>
          </Accordion>
          <DottedDivider />
        </Fragment>
      ))}
    </Box>
  )
}

export default PoolAccordion
