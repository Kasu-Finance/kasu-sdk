import { Box, SxProps, Theme, Typography, TypographyProps } from '@mui/material'
import Image from 'next/image'
import React, { ReactNode } from 'react'

import { LoyaltyLevel } from '@/hooks/locking/useLoyaltyLevel'

import UnorderedList from '@/components/atoms/UnorderedList'
import { getCrown } from '@/components/organisms/header/CurrentLoyaltyCrown'

import { customTypography } from '@/themes/typography'

type LoyaltyLevelInfoProps = {
  loyaltyLevel: LoyaltyLevel
  title: ReactNode
  subtitle: ReactNode
  description?: ReactNode
  list?: ReactNode[]
  rootStyles?: SxProps<Theme>
  titleProps?: TypographyProps
  subtitleProps?: TypographyProps
  descriptionProps?: TypographyProps
  listProps?: SxProps<Theme>
  listLabelProps?: TypographyProps
}

const LoyaltyLevelInfo: React.FC<LoyaltyLevelInfoProps> = ({
  loyaltyLevel,
  title,
  subtitle,
  description,
  list,
  rootStyles,
  titleProps,
  subtitleProps,
  descriptionProps,
  listProps,
  listLabelProps,
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
        {subtitle}
      </Typography>
      {list && (
        <UnorderedList
          sx={[
            {
              mt: 1,
              pl: 2,
              li: {
                ...customTypography.baseSm,
              },
            },
            ...(Array.isArray(listProps) ? listProps : [listProps]),
          ]}
        >
          {list.map((label, index) => (
            <li key={index}>
              <Typography
                variant='body2'
                component='p'
                fontSize={{ xs: 10, sm: 12 }}
                {...listLabelProps}
              >
                {label}
              </Typography>
            </li>
          ))}
        </UnorderedList>
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
