import { Box, Button, Stack, Typography } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import InfoRow from '@/components/atoms/InfoRow'
import WaveBox from '@/components/atoms/WaveBox'
import DialogHeader from '@/components/molecules/DialogHeader'

import { CopyIcon } from '@/assets/icons'

import { customTypography } from '@/themes/typography'
import { formatAmount } from '@/utils'

const ReferralModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { t } = getTranslation()

  const handleClick = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const referralCode = 'abc123'

  return (
    <CustomCard>
      <DialogHeader
        title={t('modals.referral.title')}
        titleProps={{ sx: { textTransform: 'unset' } }}
        onClose={handleClose}
      />
      <WaveBox variant='gold' px={2} py={3} borderRadius={2}>
        <Stack spacing={3}>
          <Stack spacing={2}>
            <Typography variant='baseMd' textAlign='center'>
              {t('modals.referral.description')}
            </Typography>
            <Box
              bgcolor='gold.dark'
              borderRadius={2}
              height={72}
              display='flex'
              alignItems='center'
              justifyContent='center'
            >
              <Button
                variant='text'
                sx={{
                  ...customTypography.baseLgBold,
                  color: 'white',
                  textTransform: 'unset',
                }}
                endIcon={<CopyIcon />}
                onClick={() =>
                  handleClick(`${window.location.origin}/${referralCode}`)
                }
              >
                {window.location.host}/{referralCode}
              </Button>
            </Box>
          </Stack>
          <Stack spacing={1}>
            <Typography variant='h4'>
              {t('modals.referral.subtitle')}
            </Typography>
            <Stack>
              <InfoRow
                title={t('modals.referral.sub-description')}
                metric={
                  <Typography variant='baseMdBold' color='gray.extraDark'>
                    25
                  </Typography>
                }
                dividerProps={{ color: 'white' }}
                showDivider
              />
              <InfoRow
                title={t('general.rewards')}
                titleStyle={{ textTransform: 'capitalize' }}
                metric={
                  <Typography variant='baseMdBold' color='gray.extraDark'>
                    {formatAmount(69.42, { minDecimals: 2 })} USD
                  </Typography>
                }
              />
            </Stack>
          </Stack>
        </Stack>
      </WaveBox>
    </CustomCard>
  )
}

export default ReferralModal
