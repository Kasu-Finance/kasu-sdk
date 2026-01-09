'use client'

import { Grid2, Step, Stepper, Typography } from '@mui/material'
import Image from 'next/image'

import useReadOnlySdk from '@/hooks/context/useReadOnlySdk'
import useLoyaltyLevel, { LoyaltyLevel } from '@/hooks/locking/useLoyaltyLevel'
import useLockingPercentage from '@/hooks/web3/useLockingPercentage'

import { getCrown } from '@/components/organisms/header/CurrentLoyaltyCrown'

const CurrentLoyaltyProgressStepper = () => {
  const readOnlySdk = useReadOnlySdk()
  const { stakedPercentage } = useLockingPercentage({ sdk: readOnlySdk })

  const { currentLevel } = useLoyaltyLevel(stakedPercentage)

  return (
    <Stepper
      activeStep={currentLevel + 1}
      connector={null}
      component={Grid2}
      container
    >
      {[...Array(3)].map((_, index, origialArray) => (
        <Step
          component={Grid2}
          key={index}
          sx={{
            zIndex: origialArray.length - index,
            flex: 1,
            ml: index !== 0 ? { xs: -2, md: -4 } : 0,
            height: 36,
            display: 'flex',
            gap: 0.5,
            justifyContent: 'end',
            alignItems: 'center',
            bgcolor: 'gold.extraLight',
            borderRadius: 30,
            color: 'gray.extraDark',
            textAlign: 'right',
            pr: 2,
            position: 'relative',
            '&::before': {
              position: 'absolute',
              content: '""',
              top: 0,
              left: 0,
              width: 0,
              height: '100%',
              borderRadius: 'inherit',
              bgcolor: 'gray.extraDark',
              transition: 'width 0.7s cubic-bezier(0, 0, 0, 1)',
              zIndex: -1,
            },
            '&.Mui-completed': {
              color: 'white',
              bgcolor: 'gray.extraDark',
              '&::before': {
                width: '100%',
              },
            },
            '&:not(.Mui-completed)': {
              boxShadow: '0px 5px 20px 0px rgba(0, 0, 0, 0.2)',
            },
          }}
        >
          <Typography variant='baseMdBold'>{index + 1}</Typography>
          <Image
            width={27}
            height={16}
            src={getCrown(index as LoyaltyLevel)}
            alt={`crown-level_${index}`}
          />
        </Step>
      ))}
    </Stepper>
  )
}

export default CurrentLoyaltyProgressStepper
