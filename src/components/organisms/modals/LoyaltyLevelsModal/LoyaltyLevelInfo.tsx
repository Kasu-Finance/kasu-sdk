import {
  Box,
  Stack,
  SxProps,
  Theme,
  Typography,
  TypographyProps,
} from '@mui/material'
import Image from 'next/image'
import React, { ReactNode } from 'react'

import { LoyaltyLevel } from '@/hooks/locking/useLoyaltyLevel'

import { getCrown } from '@/components/organisms/header/CurrentLoyaltyCrown'

import { PartialVerifiedIcon, VerifiedIcon } from '@/assets/icons'

type LoyaltyLevelInfoProps = {
  loyaltyLevel: LoyaltyLevel
  title: ReactNode
  subtitle: ReactNode
  description?: ReactNode
  benefits?: {
    title: string
    isPartial?: boolean
    description: {
      title: string
      value: string
    }
  }[]
  rootStyles?: SxProps<Theme>
  titleProps?: TypographyProps
  subtitleProps?: TypographyProps
  descriptionProps?: TypographyProps
}

const LoyaltyLevelInfo: React.FC<LoyaltyLevelInfoProps> = ({
  loyaltyLevel,
  title,
  subtitle,
  description,
  benefits,
  rootStyles,
  titleProps,
  subtitleProps,
  descriptionProps,
}) => {
  return (
    <Box bgcolor='gold.dark' borderRadius={2} p={2} sx={rootStyles}>
      <Box display='flex' alignItems='center' mb={1}>
        <Image
          src={getCrown(loyaltyLevel)}
          alt={`crown-level_${loyaltyLevel}`}
          width={81}
          height={48}
        />
        <Typography variant='h4' {...titleProps}>
          {title}
        </Typography>
      </Box>
      <Typography
        display='inline-block'
        variant='baseSm'
        component='span'
        {...subtitleProps}
      >
        <Typography variant='baseSmBold'>HOW? </Typography>
        {subtitle}
      </Typography>
      {benefits && (
        <Stack spacing={2} mt={2}>
          {benefits.map((benefit, index) => (
            <Stack spacing={1} key={index}>
              <Box display='flex' alignItems='center' gap={1}>
                {benefit.isPartial ? <PartialVerifiedIcon /> : <VerifiedIcon />}
                <Typography variant='baseSmBold'>{benefit.title}</Typography>
              </Box>
              <Typography variant='baseSm'>
                <Typography variant='baseSmBold'>
                  {benefit.description.title}:{' '}
                </Typography>
                {benefit.description.value}
              </Typography>
            </Stack>
          ))}
        </Stack>
      )}
      {description && (
        <Typography
          display='inline-block'
          variant='baseSm'
          component='span'
          mt={1}
          {...descriptionProps}
        >
          {description}
        </Typography>
      )}
    </Box>
  )
}

export default LoyaltyLevelInfo
