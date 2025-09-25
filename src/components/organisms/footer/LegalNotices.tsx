import { Button, Stack, Typography } from '@mui/material'
import React from 'react'

type LegalNoticesProps = {
  isLiteMode?: boolean
}

const LegalNotices: React.FC<LegalNoticesProps> = ({ isLiteMode }) => (
  <Stack spacing={1}>
    <Typography
      variant='baseMdBold'
      color={isLiteMode ? 'textPrimary' : 'white'}
    >
      Legal Notices:
    </Typography>
    <Button
      href='https://docs.kasu.finance/legal-notices/privacy-policy'
      target='_blank'
      rel='noopener noreferrer'
      sx={{
        width: 'max-content',
        height: 'max-content',
        p: 0,
        textTransform: 'capitalize',
      }}
    >
      Privacy Policy
    </Button>
    <Button
      href='https://docs.kasu.finance/legal-notices/platform-access-and-use-terms-of-use'
      target='_blank'
      rel='noopener noreferrer'
      sx={{
        width: 'max-content',
        height: 'max-content',
        p: 0,
        textTransform: 'unset',
      }}
    >
      Terms of Use
    </Button>
  </Stack>
)

export default LegalNotices
