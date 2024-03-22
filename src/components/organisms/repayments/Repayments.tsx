import { Box } from '@mui/material'
import React, { useEffect, useState } from 'react'

import CardSkeleton from '@/components/molecules/loaders/CardSkeleton'
import RepaymentsCard from '@/components/molecules/repayments/RepaymentsCard'

const Repayments: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <Box mt={3}>
      {loading ? (
        <CardSkeleton
          leftRowNumbers={3}
          rightRowNumbers={3}
          showSubtitle
          titleStyle={{ width: '15%' }}
          subtitleStyle={{ width: '20%' }}
        />
      ) : (
        <RepaymentsCard />
      )}
    </Box>
  )
}

export default Repayments
