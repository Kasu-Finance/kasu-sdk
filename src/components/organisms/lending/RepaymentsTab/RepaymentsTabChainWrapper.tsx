'use client'

import { PoolRepayment } from '@kasufinance/kasu-sdk/src/services/DataService/types'
import { Box, CircularProgress, Typography } from '@mui/material'
import { useEffect, useState } from 'react'

import { useChain } from '@/hooks/context/useChain'
import usePoolRepayment from '@/hooks/lending/usePoolRepayment'
import getTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import CustomCardHeader from '@/components/atoms/CustomCard/CustomCardHeader'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import EmptyDataPlaceholder from '@/components/atoms/EmptyDataPlaceholder'
import WaveBox from '@/components/atoms/WaveBox'
import CsvDownloadButton from '@/components/organisms/lending/RepaymentsTab/CsvDownloadButton'

import { DEFAULT_CHAIN_ID } from '@/config/chains'

type RepaymentsTabChainWrapperProps = {
  /** Pool ID */
  poolId: string
  /** Server-rendered repayment data (from default chain, null if not found) */
  serverRepayment: PoolRepayment | null
}

/**
 * Chain-aware wrapper for RepaymentsTab content.
 *
 * On DEFAULT_CHAIN (Base): Uses server-rendered data.
 * On other chains (XDC): Fetches repayment data client-side with pool mapping.
 */
const RepaymentsTabChainWrapper: React.FC<RepaymentsTabChainWrapperProps> = ({
  poolId,
  serverRepayment,
}) => {
  const { t } = getTranslation()
  const { currentChainId } = useChain()
  const isDefaultChain = currentChainId === DEFAULT_CHAIN_ID
  const [hasMounted, setHasMounted] = useState(false)

  // Fetch repayment data client-side for non-default chains (with pool mapping)
  const { repayment: clientRepayment, isLoading } = usePoolRepayment(poolId)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  // Render the repayments content
  const renderContent = (repayment: PoolRepayment | null) => (
    <CustomCard sx={{ mt: 3 }}>
      <CustomCardHeader title={t('repayments.title')} />
      <WaveBox borderRadius={2}>
        <Box px={2} py={3} display='flex' flexDirection='column'>
          <Typography variant='baseMd' component='p'>
            {t('repayments.loanModelDescription')}
          </Typography>
          {repayment && (
            <>
              <Typography
                variant='baseMd'
                my={2}
                textAlign='center'
                display='block'
                component='p'
              >
                {t('repayments.borrowerFundsCSV')}
              </Typography>
              <CsvDownloadButton repayment={repayment} />
            </>
          )}
        </Box>
        <CustomInnerCardContent sx={{ py: 3 }}>
          <EmptyDataPlaceholder text='Loan repayments data coming soon' />
        </CustomInnerCardContent>
      </WaveBox>
    </CustomCard>
  )

  // Loading content for non-default chains
  const renderLoading = () => (
    <CustomCard sx={{ mt: 3 }}>
      <CustomCardHeader title={t('repayments.title')} />
      <WaveBox borderRadius={2}>
        <Box
          display='flex'
          flexDirection='column'
          alignItems='center'
          justifyContent='center'
          minHeight={200}
          gap={2}
        >
          <CircularProgress color='primary' />
          <Typography variant='baseMd' color='white'>
            Loading repayment data...
          </Typography>
        </Box>
      </WaveBox>
    </CustomCard>
  )

  // Before mount, match server rendering
  if (!hasMounted) {
    return renderContent(serverRepayment)
  }

  // On default chain, use server data
  if (isDefaultChain) {
    return renderContent(serverRepayment)
  }

  // On non-default chains, show loading while fetching
  if (isLoading) {
    return renderLoading()
  }

  // On non-default chains, use client-fetched data
  return renderContent(clientRepayment ?? null)
}

export default RepaymentsTabChainWrapper
