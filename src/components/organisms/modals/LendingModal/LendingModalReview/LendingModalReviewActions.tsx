import { Box, Button } from '@mui/material'
import { useCallback, useMemo, useRef, useState } from 'react'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useModalState from '@/hooks/context/useModalState'
import useStepperState from '@/hooks/context/useStepperState'
import useToastState from '@/hooks/context/useToastState'
import useGenerateContract from '@/hooks/lending/useGenerateContract'
import useRequestDeposit from '@/hooks/lending/useRequestDeposit'
import getTranslation from '@/hooks/useTranslation'
import useApproveToken from '@/hooks/web3/useApproveToken'

import BlockingStepperModal from '@/components/molecules/BlockingStepperModal'

import { ModalsKeys } from '@/context/modal/modal.types'

import sdkConfig, { USDC } from '@/config/sdk'
import dayjs from '@/dayjs'
import { userRejectedTransaction } from '@/utils'

type LendingActionStepId =
  | 'generate'
  | 'review'
  | 'confirm'
  | 'approve'
  | 'request'

type LendingActionStepStatus =
  | 'pending'
  | 'executing'
  | 'success'
  | 'error'
  | 'cancelled'

type StepFailureStatus = 'error' | 'cancelled'

type LendingActionStep = {
  id: LendingActionStepId
  label: string
  status: LendingActionStepStatus
  description?: string
  errorMessage?: string
  canRetry?: boolean
  showSpinner?: boolean
}

const lendingActionStepsOrder: LendingActionStepId[] = [
  'generate',
  'review',
  'confirm',
  'approve',
  'request',
]

const LOAN_CONTRACT_MODAL_CLOSED_MESSAGE = 'Loan contract modal closed'
const LOAN_CONTRACT_EXPIRED_ERROR_NAME = 'LoanContractExpired'

const getNextIncompleteStepIndex = (steps: LendingActionStep[]) =>
  steps.findIndex((step) => step.status !== 'success')

const LendingModalReviewActions = () => {
  const { t } = getTranslation()

  const { generatedContract, generateContract, resetGeneratedContract } =
    useGenerateContract()

  const [contractAcceptedSignature, setContractAcceptedSignature] = useState<
    string | undefined
  >(undefined)
  const contractAcceptedSignatureRef = useRef<string | undefined>(undefined)
  const generatedContractRef = useRef<typeof generatedContract | null>(null)

  const { prevStep } = useStepperState()

  const { setToast } = useToastState()

  const requestDeposit = useRequestDeposit()

  const { openModal } = useModalState()

  const {
    amount,
    trancheId,
    loanContractAccepted,
    fixedTermConfigId,
    pool,
    currentEpochDepositedAmountMap,
    setLoanContractAcccepted,
  } = useDepositModalState()

  const { isApproved, approve } = useApproveToken(
    USDC as `0x${string}`,
    sdkConfig.contracts.LendingPoolManager as `0x${string}`,
    amount
  )

  const approvalRequired = !isApproved
  const isContractConfirmed =
    loanContractAccepted &&
    Boolean(contractAcceptedSignatureRef.current ?? contractAcceptedSignature)

  const contractStepRef = useRef<{
    resolve: () => void
    reject: (error?: Error) => void
  } | null>(null)

  const stepLabels = useMemo(
    () => ({
      generate: t('modals.lending.stepper.steps.generate'),
      review: t('modals.lending.stepper.steps.review'),
      confirm: t('modals.lending.stepper.steps.confirm'),
      approve: t('modals.lending.stepper.steps.approve'),
      request: t('modals.lending.stepper.steps.request'),
    }),
    [t]
  )

  const stepDescriptions = useMemo<
    Partial<Record<LendingActionStepId, string>>
  >(
    () => ({
      generate: t('modals.lending.stepper.descriptions.generate'),
      confirm: t('modals.lending.stepper.descriptions.confirm'),
      approve: t('modals.lending.stepper.descriptions.approve'),
      request: t('modals.lending.stepper.descriptions.request'),
    }),
    [t]
  )

  const generateProcessingDescription = useMemo(
    () => t('modals.lending.stepper.descriptions.generateProcessing'),
    [t]
  )

  const waitingConfirmationDescription = useMemo(
    () => t('modals.lending.stepper.descriptions.waitingConfirmation'),
    [t]
  )

  const stepErrorMessages = useMemo(
    () => ({
      generate: {
        error: t('modals.lending.stepper.errors.generate.failed'),
        cancelled: t('modals.lending.stepper.errors.generate.cancelled'),
      },
      confirm: {
        error: t('modals.lending.stepper.errors.confirm.failed'),
        cancelled: t('modals.lending.stepper.errors.confirm.cancelled'),
      },
      approve: {
        error: t('modals.lending.stepper.errors.approve.failed'),
        cancelled: t('modals.lending.stepper.errors.approve.cancelled'),
      },
      request: {
        error: t('modals.lending.stepper.errors.request.failed'),
        cancelled: t('modals.lending.stepper.errors.request.cancelled'),
        expired: t('modals.lending.stepper.errors.request.expired'),
      },
    }),
    [t]
  )

  const buildSteps = useCallback(
    (): LendingActionStep[] =>
      lendingActionStepsOrder.map((step) => ({
        id: step,
        label: stepLabels[step],
        status: 'pending',
        description: stepDescriptions[step],
        showSpinner: false,
      })),
    [stepDescriptions, stepLabels]
  )

  const getInitialSteps = useCallback((): LendingActionStep[] => {
    const steps = buildSteps()

    if (generatedContract.status) {
      steps[0].status = 'success'
    }

    if (isContractConfirmed) {
      steps[1].status = 'success'
      steps[2].status = 'success'
    }

    if (!approvalRequired) {
      steps[3].status = 'success'
    }

    return steps
  }, [
    approvalRequired,
    buildSteps,
    generatedContract.status,
    isContractConfirmed,
  ])

  const getResetContractSteps = useCallback((): LendingActionStep[] => {
    const steps = buildSteps()

    if (!approvalRequired) {
      steps[3].status = 'success'
    }

    return steps
  }, [approvalRequired, buildSteps])

  const [actionSteps, setActionSteps] = useState<LendingActionStep[]>(() =>
    getInitialSteps()
  )
  const [activeActionStep, setActiveActionStep] = useState(0)
  const [isStepperOpen, setIsStepperOpen] = useState(false)
  const [isFlowRunning, setIsFlowRunning] = useState(false)
  const flowCancelledRef = useRef(false)

  const setStepStatus = useCallback(
    (id: LendingActionStepId, status: LendingActionStepStatus) => {
      if (flowCancelledRef.current) return

      setActionSteps((prev) =>
        prev.map((step) =>
          step.id === id
            ? {
                ...step,
                status,
                errorMessage: undefined,
                canRetry: false,
                showSpinner: status === 'executing' ? step.showSpinner : false,
              }
            : step
        )
      )
    },
    []
  )

  const setStepMeta = useCallback(
    (
      id: LendingActionStepId,
      updates: Pick<LendingActionStep, 'description' | 'showSpinner'>
    ) => {
      if (flowCancelledRef.current) return

      setActionSteps((prev) =>
        prev.map((step) =>
          step.id === id
            ? {
                ...step,
                ...updates,
              }
            : step
        )
      )
    },
    []
  )

  const setActiveStepById = useCallback((id: LendingActionStepId) => {
    const index = lendingActionStepsOrder.indexOf(id)
    setActiveActionStep(Math.max(0, index))
  }, [])

  const setStepFailure = useCallback(
    (
      id: LendingActionStepId,
      status: StepFailureStatus,
      errorMessage: string,
      options?: { activeStepIndex?: number; baseSteps?: LendingActionStep[] }
    ) => {
      if (flowCancelledRef.current) return

      const baseSteps = options?.baseSteps
      const updateStep = (steps: LendingActionStep[]) =>
        steps.map((step) =>
          step.id === id
            ? {
                ...step,
                status,
                errorMessage,
                canRetry: true,
                showSpinner: false,
              }
            : step
        )

      if (baseSteps) {
        setActionSteps(updateStep(baseSteps))
      } else {
        setActionSteps((prev) => updateStep(prev))
      }

      const index = lendingActionStepsOrder.indexOf(id)
      const fallbackIndex = Math.max(0, index - 1)
      setActiveActionStep(options?.activeStepIndex ?? fallbackIndex)
      setIsStepperOpen(true)
    },
    []
  )

  const buildContractPayload = useCallback(() => {
    if (!generatedContract.contractMessage) {
      return null
    }

    return {
      contractMessage: generatedContract.contractMessage,
      formattedMessage: generatedContract.formattedMessage,
      fullName: generatedContract.fullName,
      contractType: generatedContract.contractType,
      contractVersion: generatedContract.contractVersion,
      createdAt: generatedContract.createdAt,
    }
  }, [generatedContract])

  const openContractModal = useCallback(
    (contractPayload: ReturnType<typeof buildContractPayload>) => {
      if (!contractPayload?.contractMessage) {
        return Promise.reject(
          new Error('OpenContractModal:: Contract message is undefined')
        )
      }

      return new Promise<void>((resolve, reject) => {
        contractStepRef.current = { resolve, reject }

        openModal({
          name: ModalsKeys.LOAN_CONTRACT,
          canAccept: true,
          generatedContract: contractPayload,
          suppressToast: true,
          acceptLoanContract: (contractSignature: string) => {
            contractAcceptedSignatureRef.current = contractSignature
            setContractAcceptedSignature(contractSignature)
            setLoanContractAcccepted(true)
            contractStepRef.current?.resolve()
            contractStepRef.current = null
          },
          onAcceptError: (error?: Error) => {
            contractStepRef.current?.reject(error)
            contractStepRef.current = null
          },
          onClose: () => {
            contractStepRef.current?.reject(
              new Error(LOAN_CONTRACT_MODAL_CLOSED_MESSAGE)
            )
            contractStepRef.current = null
          },
        })
      })
    },
    [openModal, setLoanContractAcccepted]
  )

  const handleRequestDeposit = useCallback(
    async (options?: {
      suppressToast?: boolean
      onError?: (status: StepFailureStatus, error?: unknown) => void
      onStatus?: (status: 'signing' | 'confirming') => void
    }) => {
      const activeContract = generatedContractRef.current ?? generatedContract
      const signature =
        contractAcceptedSignatureRef.current ?? contractAcceptedSignature

      if (!fixedTermConfigId) {
        const error = new Error(
          'RequestDeposit:: FixedTermConfigID is undefined'
        )
        console.error(error.message)
        options?.onError?.('error', error)
        return false
      }

      if (!signature) {
        const error = new Error(
          'RequestDeposit:: contractAcceptedSignature is undefined'
        )
        console.error(error.message)
        options?.onError?.('error', error)
        return false
      }

      if (!activeContract?.createdAt) {
        const error = new Error(
          'RequestDeposit:: contract createdAt is undefined'
        )
        console.error(error.message)
        options?.onError?.('error', error)
        return false
      }

      const amount =
        currentEpochDepositedAmountMap?.get(trancheId.toLowerCase()) ?? '0'

      if (
        dayjs
          .unix(activeContract.createdAt / 1000)
          .add(5, 'minutes')
          .isBefore(dayjs())
      ) {
        const error = new Error('Loan contract expired')
        error.name = LOAN_CONTRACT_EXPIRED_ERROR_NAME

        if (!options?.suppressToast) {
          setToast({
            type: 'error',
            title: 'Loan Contract Expired',
            message:
              'The Loan Contract you generated has expired. Please try again.',
          })
        } else {
          console.error(error.message)
        }

        options?.onError?.('error', error)
        resetGeneratedContract()
        setContractAcceptedSignature(undefined)
        contractAcceptedSignatureRef.current = undefined
        generatedContractRef.current = null
        setLoanContractAcccepted(false)
        return false
      }

      const selectedTranche = pool.tranches.find(
        (tranche) => tranche.id === trancheId
      )

      if (!selectedTranche) {
        const error = new Error('RequestDeposit:: Selected tranche not found.')
        console.error(error.message)
        options?.onError?.('error', error)
        return false
      }

      const requestSuccess = await requestDeposit(
        pool.id as `0x${string}`,
        selectedTranche,
        fixedTermConfigId,
        amount,
        signature,
        activeContract.createdAt,
        activeContract.contractVersion,
        activeContract.contractType,
        options
      )

      return requestSuccess
    },
    [
      contractAcceptedSignature,
      currentEpochDepositedAmountMap,
      fixedTermConfigId,
      generatedContract,
      pool,
      requestDeposit,
      resetGeneratedContract,
      setLoanContractAcccepted,
      setToast,
      trancheId,
    ]
  )

  const adjust = () => {
    setIsStepperOpen(false)
    resetGeneratedContract()
    setLoanContractAcccepted(false)
    setContractAcceptedSignature(undefined)
    contractAcceptedSignatureRef.current = undefined
    generatedContractRef.current = null
    prevStep()
  }

  const handleCancelStepper = useCallback(() => {
    flowCancelledRef.current = true
    const initialSteps = getInitialSteps()
    const nextStepIndex = getNextIncompleteStepIndex(initialSteps)

    setActionSteps(initialSteps)
    setActiveActionStep(Math.max(0, nextStepIndex))
    setIsStepperOpen(false)
    setIsFlowRunning(false)
  }, [getInitialSteps])

  const handleGenerateStep = useCallback(async () => {
    setActiveStepById('generate')
    setStepStatus('generate', 'executing')
    setStepMeta('generate', {
      description: stepDescriptions.generate,
      showSpinner: false,
    })

    const generatedResult = await generateContract(amount, {
      suppressToast: true,
      onStatus: (status) => {
        if (status === 'generating') {
          setStepMeta('generate', {
            description: generateProcessingDescription,
            showSpinner: true,
          })
        }
      },
    })

    if (generatedResult.status === 'cancelled') {
      setActionSteps(getInitialSteps())
      setActiveActionStep(0)
      setIsStepperOpen(false)
      return null
    }

    if (generatedResult.status !== 'success' || !generatedResult.contract) {
      setStepFailure('generate', 'error', stepErrorMessages.generate.error)
      return null
    }

    generatedContractRef.current = generatedResult.contract
    setStepStatus('generate', 'success')

    return generatedResult.contract
  }, [
    amount,
    generateContract,
    generateProcessingDescription,
    getInitialSteps,
    setActiveStepById,
    setStepFailure,
    setStepStatus,
    setStepMeta,
    stepDescriptions.generate,
    stepErrorMessages.generate.error,
  ])

  const handleContractSteps = useCallback(
    async (contractPayload: ReturnType<typeof buildContractPayload>) => {
      setStepStatus('review', 'success')
      setStepStatus('confirm', 'executing')
      setActiveStepById('confirm')
      setIsStepperOpen(false)

      let shouldReopenStepper = true

      try {
        await openContractModal(contractPayload)
        setStepStatus('confirm', 'success')
        return true
      } catch (error) {
        const wasCancelled =
          userRejectedTransaction(error) ||
          (error instanceof Error &&
            error.message === LOAN_CONTRACT_MODAL_CLOSED_MESSAGE)

        if (wasCancelled) {
          shouldReopenStepper = false
          handleCancelStepper()
          return false
        }

        setStepFailure('confirm', 'error', stepErrorMessages.confirm.error)
        return false
      } finally {
        if (shouldReopenStepper) {
          setIsStepperOpen(true)
        }
      }
    },
    [
      handleCancelStepper,
      openContractModal,
      setActiveStepById,
      setStepFailure,
      setStepStatus,
      stepErrorMessages.confirm.error,
    ]
  )

  const handleApproveStep = useCallback(async () => {
    setActiveStepById('approve')
    setStepStatus('approve', 'executing')
    setStepMeta('approve', {
      description: stepDescriptions.approve,
      showSpinner: false,
    })

    let failureStatus: StepFailureStatus | null = null

    const approveSuccess = await approve(amount, {
      suppressToast: true,
      onStatus: (status) => {
        if (status === 'confirming') {
          setStepMeta('approve', {
            description: waitingConfirmationDescription,
            showSpinner: true,
          })
        }
      },
      onError: (status) => {
        failureStatus = status
      },
    })

    if (!approveSuccess) {
      if (failureStatus === 'cancelled') {
        handleCancelStepper()
        return false
      }

      setStepFailure('approve', 'error', stepErrorMessages.approve.error)
      return false
    }

    setStepStatus('approve', 'success')
    return true
  }, [
    amount,
    approve,
    handleCancelStepper,
    setActiveStepById,
    setStepFailure,
    setStepStatus,
    setStepMeta,
    stepDescriptions.approve,
    stepErrorMessages.approve.error,
    waitingConfirmationDescription,
  ])

  const handleRequestDepositStep = useCallback(async () => {
    setActiveStepById('request')
    setStepStatus('request', 'executing')
    setStepMeta('request', {
      description: stepDescriptions.request,
      showSpinner: false,
    })

    let failureStatus: StepFailureStatus | null = null
    let failureReason: 'expired' | null = null

    const requestSuccess = await handleRequestDeposit({
      suppressToast: true,
      onStatus: (status) => {
        if (status === 'confirming') {
          setStepMeta('request', {
            description: waitingConfirmationDescription,
            showSpinner: true,
          })
        }
      },
      onError: (status, error) => {
        failureStatus = status
        if (
          error instanceof Error &&
          error.name === LOAN_CONTRACT_EXPIRED_ERROR_NAME
        ) {
          failureReason = 'expired'
        }
      },
    })

    if (!requestSuccess) {
      if (failureStatus === 'cancelled') {
        handleCancelStepper()
        return false
      }

      const errorMessage =
        failureReason === 'expired'
          ? stepErrorMessages.request.expired
          : stepErrorMessages.request.error

      const baseSteps =
        failureReason === 'expired' ? getResetContractSteps() : undefined
      const activeStepIndex =
        failureReason === 'expired'
          ? Math.max(0, getNextIncompleteStepIndex(baseSteps ?? []))
          : undefined
      const errorStepId: LendingActionStepId =
        failureReason === 'expired' ? 'generate' : 'request'

      setStepFailure(errorStepId, 'error', errorMessage, {
        baseSteps,
        activeStepIndex,
      })
      return false
    }

    setStepStatus('request', 'success')
    return true
  }, [
    getResetContractSteps,
    handleCancelStepper,
    handleRequestDeposit,
    setActiveStepById,
    setStepFailure,
    setStepStatus,
    setStepMeta,
    stepDescriptions.request,
    stepErrorMessages.request.error,
    stepErrorMessages.request.expired,
    waitingConfirmationDescription,
  ])

  const handleStartFlow = useCallback(async () => {
    if (isFlowRunning) return

    flowCancelledRef.current = false
    setIsFlowRunning(true)

    const initialSteps = getInitialSteps()
    const nextStepIndex = getNextIncompleteStepIndex(initialSteps)

    setActionSteps(initialSteps)

    if (generatedContract.status) {
      generatedContractRef.current = generatedContract
    }

    if (nextStepIndex === -1) {
      setIsStepperOpen(false)
      setIsFlowRunning(false)
      return
    }

    setActiveActionStep(Math.max(0, nextStepIndex))
    setIsStepperOpen(true)

    try {
      let contractPayload = buildContractPayload()

      if (!generatedContract.status) {
        const generated = await handleGenerateStep()

        if (flowCancelledRef.current) return

        if (!generated) return

        contractPayload = {
          contractMessage: generated.contractMessage,
          formattedMessage: generated.formattedMessage,
          fullName: generated.fullName,
          contractType: generated.contractType,
          contractVersion: generated.contractVersion,
          createdAt: generated.createdAt,
        }
      }

      if (!isContractConfirmed) {
        const contractReady = await handleContractSteps(contractPayload)

        if (flowCancelledRef.current) return

        if (!contractReady) return
      }

      if (approvalRequired) {
        const approved = await handleApproveStep()

        if (flowCancelledRef.current) return

        if (!approved) return
      } else {
        setStepStatus('approve', 'success')
      }

      const deposited = await handleRequestDepositStep()

      if (flowCancelledRef.current) return

      if (!deposited) return

      setIsStepperOpen(false)
    } finally {
      setIsFlowRunning(false)
    }
  }, [
    approvalRequired,
    buildContractPayload,
    generatedContract,
    getInitialSteps,
    handleApproveStep,
    handleContractSteps,
    handleGenerateStep,
    handleRequestDepositStep,
    isFlowRunning,
    isContractConfirmed,
    setStepStatus,
  ])

  const handleRetryStep = useCallback(
    (_stepId: string) => {
      if (isFlowRunning) return
      handleStartFlow()
    },
    [handleStartFlow, isFlowRunning]
  )

  return (
    <>
      <Box
        display='flex'
        gap={{ xs: 2, sm: 4 }}
        flexDirection={{ xs: 'column', sm: 'row' }}
      >
        <Button
          variant='outlined'
          color='secondary'
          onClick={adjust}
          fullWidth
          sx={{ textTransform: 'capitalize' }}
          disabled={isFlowRunning}
        >
          {t('general.amend')}
        </Button>
        <Button
          variant='contained'
          color='secondary'
          fullWidth
          onClick={handleStartFlow}
          sx={{ textTransform: 'capitalize' }}
          disabled={isFlowRunning}
        >
          {isContractConfirmed
            ? approvalRequired
              ? t('general.approve')
              : t('general.confirm')
            : generatedContract.status
              ? t('modals.loanContract.actions.view')
              : t('modals.loanContract.actions.generate')}
        </Button>
      </Box>
      <BlockingStepperModal
        open={isStepperOpen}
        title={t('modals.lending.stepper.title')}
        steps={actionSteps}
        activeStepIndex={activeActionStep}
        onRetry={handleRetryStep}
        isBusy={isFlowRunning}
        onClose={handleCancelStepper}
      />
    </>
  )
}

export default LendingModalReviewActions
