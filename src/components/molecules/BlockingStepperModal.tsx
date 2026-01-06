'use client'

import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  IconButton,
  keyframes,
  Stack,
  Typography,
} from '@mui/material'
import { ReactNode } from 'react'

import getTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'

import { CloseRoundedIcon } from '@/assets/icons'

export type StepperStatus =
  | 'pending'
  | 'executing'
  | 'success'
  | 'error'
  | 'cancelled'

export type StepperStep = {
  id: string
  label: string
  status: StepperStatus
  description?: string
  errorMessage?: string
  canRetry?: boolean
  showSpinner?: boolean
}

type BlockingStepperModalProps = {
  open: boolean
  title: string
  steps: StepperStep[]
  activeStepIndex: number
  actions?: ReactNode
  onRetry?: (stepId: string) => void
  isBusy?: boolean
  onClose?: () => void
}

const blink = keyframes`
  0%, 100% { opacity: 0.25; }
  50% { opacity: 1; }
`

const stepSpacingPx = 20
const stepSpacing = stepSpacingPx / 8
const stepCircleSize = 28

const BlockingStepperModal: React.FC<BlockingStepperModalProps> = ({
  open,
  title,
  steps,
  activeStepIndex,
  actions,
  onRetry,
  isBusy,
  onClose,
}) => {
  const { t } = getTranslation()

  const getStatusLabel = (status: StepperStatus) => {
    switch (status) {
      case 'success':
        return t('general.completed')
      case 'cancelled':
        return t('general.cancelledStatus')
      default:
        return null
    }
  }

  return (
    <Backdrop
      open={open}
      sx={{
        zIndex: 2000,
        color: 'white',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
      }}
    >
      <CustomCard
        sx={{
          flex: 'initial',
          width: { xs: 'calc(100% - 32px)', sm: 520 },
          maxWidth: '100%',
          position: 'relative',
          px: { xs: 2.5, sm: 4 },
          py: { xs: 3, sm: 4 },
          background: 'url("/images/wave-dark-gray.png") repeat',
          backgroundSize: '17px 16px',
          backgroundColor: 'gray.extraDark',
          boxShadow: '0px 5px 20px 0px rgba(0, 0, 0, 0.15)',
        }}
      >
        {onClose ? (
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              top: { xs: -48, sm: -56 },
              right: { xs: -24, sm: -56 },
              color: 'gold.extraLight',
              backgroundColor: 'gray.extraDark',
              zIndex: 2,
              '&:hover': {
                backgroundColor: 'gray.dark',
              },
            }}
          >
            <CloseRoundedIcon />
          </IconButton>
        ) : null}
        <Box
          sx={{
            bgcolor: 'gray.extraDark',
            mx: { xs: -2.5, sm: -4 },
            mt: { xs: -3, sm: -4 },
            px: { xs: 2.5, sm: 4 },
            py: 2,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            mb: 3,
          }}
        >
          <Typography variant='h4' sx={{ color: 'gold.darkNoises' }}>
            {title}
          </Typography>
        </Box>
        <Stack spacing={stepSpacing}>
          {steps.map((step, index) => {
            const statusLabel = getStatusLabel(step.status)
            const isActive = index === activeStepIndex
            const isSuccess = step.status === 'success'
            const isError = step.status === 'error'
            const isExecuting = step.status === 'executing'
            const isCancelled = step.status === 'cancelled'
            const isLastStep = index === steps.length - 1
            const connectorColor = isSuccess
              ? 'white'
              : isError
                ? 'error.main'
                : isCancelled
                  ? 'warning.main'
                  : isActive
                    ? 'gold.dark'
                    : 'gold.middle'

            return (
              <Box
                key={step.id}
                display='flex'
                alignItems='stretch'
                gap={2}
                sx={{ position: 'relative' }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    width: stepCircleSize,
                    flexShrink: 0,
                    position: 'relative',
                    alignSelf: 'stretch',
                  }}
                >
                  <Box
                    sx={{
                      width: stepCircleSize,
                      height: stepCircleSize,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                      zIndex: 1,
                      border: '2px solid',
                      borderColor: isError
                        ? 'error.main'
                        : isCancelled
                          ? 'warning.main'
                          : isSuccess
                            ? 'white'
                            : isActive
                              ? 'gold.extraLight'
                              : 'gold.middle',
                      bgcolor: isSuccess
                        ? 'white'
                        : isError
                          ? 'transparent'
                          : isCancelled
                            ? 'transparent'
                            : isActive
                              ? 'gold.dark'
                              : 'gray.extraDark',
                      color: isSuccess
                        ? 'gray.extraDark'
                        : isError
                          ? 'error.main'
                          : isCancelled
                            ? 'warning.main'
                            : 'gold.extraLight',
                      animation: isExecuting
                        ? `${blink} 1.1s ease-in-out infinite`
                        : 'none',
                      boxShadow: isActive
                        ? '0 0 0 3px rgba(196, 153, 108, 0.35)'
                        : 'none',
                    }}
                  >
                    {index + 1}
                  </Box>
                  {!isLastStep ? (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: stepCircleSize,
                        bottom: -stepSpacingPx,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        borderLeft: '2px dotted',
                        borderColor: connectorColor,
                        opacity: 0.6,
                      }}
                    />
                  ) : null}
                </Box>
                <Box flex={1}>
                  <Stack spacing={1} alignItems='flex-start'>
                    <Typography
                      variant='baseMdBold'
                      sx={{ color: 'gold.dark', display: 'block' }}
                    >
                      {step.label}
                    </Typography>
                    {isExecuting && step.description ? (
                      <Box
                        display='flex'
                        alignItems='center'
                        gap={1}
                        sx={{ width: '100%' }}
                      >
                        <Typography
                          variant='baseSm'
                          sx={{ color: 'white', display: 'block' }}
                        >
                          {step.description}
                        </Typography>
                        {step.showSpinner ? (
                          <CircularProgress
                            size={12}
                            thickness={5}
                            sx={{ color: 'white' }}
                          />
                        ) : null}
                      </Box>
                    ) : null}
                    {step.errorMessage ? (
                      <Typography
                        variant='baseSm'
                        sx={{
                          color: isCancelled ? 'warning.main' : 'error.main',
                          display: 'block',
                        }}
                      >
                        {step.errorMessage}
                      </Typography>
                    ) : null}
                    {step.canRetry && onRetry ? (
                      <Button
                        variant='contained'
                        color='secondary'
                        size='medium'
                        onClick={() => onRetry(step.id)}
                        disabled={isBusy}
                        sx={{
                          textTransform: 'capitalize',
                          fontWeight: 600,
                        }}
                      >
                        {t('general.tryAgain')}
                      </Button>
                    ) : null}
                    {statusLabel ? (
                      <Typography
                        variant='baseSm'
                        sx={{
                          color:
                            step.status === 'success'
                              ? 'white'
                              : step.status === 'cancelled'
                                ? 'warning.main'
                                : 'white',
                        }}
                      >
                        {statusLabel}
                      </Typography>
                    ) : null}
                  </Stack>
                </Box>
              </Box>
            )
          })}
        </Stack>
        {actions ? <Box mt={3}>{actions}</Box> : null}
      </CustomCard>
    </Backdrop>
  )
}

export default BlockingStepperModal
