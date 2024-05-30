import VerifiedIcon from '@mui/icons-material/Verified'
import { Box, SxProps, Theme, Typography, TypographyProps } from '@mui/material'
import React from 'react'

import ColoredBox from '@/components/atoms/ColoredBox'
import UnorderedList from '@/components/atoms/UnorderedList'

type LoyaltyLevelInfoProps = {
  title: string
  subtitle?: string
  description?: string
  list?: string[]
  rootStyles?: SxProps<Theme>
  titleProps?: TypographyProps
  subtitleProps?: TypographyProps
  descriptionProps?: TypographyProps
  listProps?: SxProps<Theme>
  listLabelProps?: TypographyProps
}

const LoyaltyLevelInfo: React.FC<LoyaltyLevelInfoProps> = ({
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
    <ColoredBox
      display='grid'
      gap={2}
      sx={[
        { px: 2, pt: 1, pb: 2 },
        ...(Array.isArray(rootStyles) ? rootStyles : [rootStyles]),
      ]}
    >
      <Box
        display='grid'
        gridTemplateColumns='max-content minmax(0, 1fr)'
        alignItems='start'
        gap={1}
      >
        <Box pt='5px'>
          <VerifiedIcon
            fontSize='small'
            sx={{ color: 'rgba(127, 116, 102, 0.54)' }}
          />
        </Box>
        <Box>
          <Typography
            variant='subtitle1'
            display='block'
            component='span'
            {...titleProps}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant='body1' component='span' {...subtitleProps}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
      {description && (
        <Typography variant='body2' component='p' {...descriptionProps}>
          {description}
        </Typography>
      )}
      {list && (
        <UnorderedList sx={listProps}>
          {list.map((label) => (
            <li key={label}>
              <Typography variant='body2' component='p' {...listLabelProps}>
                {label}
              </Typography>
            </li>
          ))}
        </UnorderedList>
      )}
    </ColoredBox>
  )
}

export default LoyaltyLevelInfo
