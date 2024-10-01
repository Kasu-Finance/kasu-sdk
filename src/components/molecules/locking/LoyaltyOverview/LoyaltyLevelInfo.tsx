import { Box, SxProps, Theme, Typography, TypographyProps } from '@mui/material'
import Image from 'next/image'
import React from 'react'

import { LoyaltyLevel } from '@/hooks/locking/useLoyaltyLevel'

import UnorderedList from '@/components/atoms/UnorderedList'
import { getCrown } from '@/components/organisms/header/CurrentLoyaltyCrown'

import { customTypography } from '@/themes/typography'

type LoyaltyLevelInfoProps = {
  loyaltyLevel: LoyaltyLevel
  title: string
  subtitle: string
  list?: string[]
  rootStyles?: SxProps<Theme>
  titleProps?: TypographyProps
  subtitleProps?: TypographyProps
  listProps?: SxProps<Theme>
  listLabelProps?: TypographyProps
}

const LoyaltyLevelInfo: React.FC<LoyaltyLevelInfoProps> = ({
  loyaltyLevel,
  title,
  subtitle,
  list,
  rootStyles,
  titleProps,
  subtitleProps,
  listProps,
  listLabelProps,
}) => {
  return (
    <Box bgcolor='gold.dark' borderRadius={2} p={2} sx={rootStyles}>
      <Box display='flex' alignItems='center'>
        <Image
          src={getCrown(loyaltyLevel)}
          alt={`crown-level_${loyaltyLevel}`}
        />
        <Typography variant='h4' {...titleProps}>
          {title}
        </Typography>
      </Box>
      <Typography variant='baseSm' component='span' {...subtitleProps}>
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
          {list.map((label) => (
            <li key={label}>
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
    </Box>
  )
}

export default LoyaltyLevelInfo
