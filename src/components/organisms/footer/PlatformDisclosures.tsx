import { Button, Stack, Typography } from '@mui/material'
import React from 'react'

type PlatformDisclosuresProps = {
  isLiteMode?: boolean
}

const PlatformDisclosures: React.FC<PlatformDisclosuresProps> = ({
  isLiteMode,
}) => (
  <Stack spacing={1}>
    <Typography
      variant='baseMdBold'
      color={isLiteMode ? 'textPrimary' : 'white'}
    >
      Platform Disclosures:
    </Typography>
    <Button
      href='https://docs.kasu.finance/important-information-when-lending/important-information'
      target='_blank'
      rel='noopener noreferrer'
      sx={{
        width: 'max-content',
        height: 'max-content',
        p: 0,
        textTransform: 'capitalize',
      }}
    >
      Important Information
    </Button>
    <Button
      href='https://docs.kasu.finance/risk-warnings/risk-warnings'
      target='_blank'
      rel='noopener noreferrer'
      sx={{
        width: 'max-content',
        height: 'max-content',
        p: 0,
        textTransform: 'capitalize',
      }}
    >
      Risk Warning
    </Button>
  </Stack>
)
export default PlatformDisclosures
