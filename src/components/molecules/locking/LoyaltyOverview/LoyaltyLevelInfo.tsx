import {
  Box,
  lighten,
  SxProps,
  Theme,
  Typography,
  TypographyProps,
} from '@mui/material'
import React from 'react'

import List from '@/components/atoms/List'

import { VerifiedIcon } from '@/assets/icons'

type LoyaltyLevelInfoProps = {
  title: string
  subtitle: string
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
    <Box
      display='grid'
      p={[1, 2]}
      gap={2}
      bgcolor={(theme) => lighten(theme.palette.primary.main, 0.96)}
      sx={rootStyles}
    >
      <Box
        display='grid'
        gridTemplateColumns='max-content minmax(0, 1fr)'
        alignItems='start'
        gap={1}
      >
        <Box pt='10px'>
          <VerifiedIcon />
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
        <Typography variant='subtitle1' component='p' {...descriptionProps}>
          {description}
        </Typography>
      )}
      {list && (
        <List sx={listProps}>
          {list.map((label) => (
            <li key={label}>
              <Typography variant='body2' component='p' {...listLabelProps}>
                {label}
              </Typography>
            </li>
          ))}
        </List>
      )}
    </Box>
  )
}

export default LoyaltyLevelInfo
