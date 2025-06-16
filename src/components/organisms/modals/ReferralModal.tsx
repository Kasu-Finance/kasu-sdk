import { Box, Button, Skeleton, Stack, Typography } from '@mui/material'
import { useAccount } from 'wagmi'

import useUserReferrals from '@/hooks/referrals/useUserReferrals'
import getTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import InfoRow from '@/components/atoms/InfoRow'
import WaveBox from '@/components/atoms/WaveBox'
import DialogHeader from '@/components/molecules/DialogHeader'

import { CopyIcon } from '@/assets/icons'

import { customPalette } from '@/themes/palette'
import { customTypography } from '@/themes/typography'
import { formatAmount } from '@/utils'

const ReferralModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { t } = getTranslation()

  const { address } = useAccount()

  const handleClick = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const referralCode = address || ''

  const { userReferrals, isLoading } = useUserReferrals()

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
              px={2}
            >
              <Button
                variant='text'
                sx={{
                  ...customTypography.baseLgBold,
                  color: 'white',
                  textTransform: 'unset',
                  px: 2,
                }}
                endIcon={<CopyIcon />}
                onClick={() =>
                  handleClick(
                    `${window.location.origin}/referrals/${referralCode}`
                  )
                }
              >
                <Typography
                  variant='inherit'
                  sx={{
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                  }}
                >
                  {window.location.host}/referrals/{referralCode}
                </Typography>
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
                  isLoading ? (
                    <Skeleton
                      width={100}
                      height={30}
                      sx={{ bgcolor: customPalette.gold.extraDark }}
                    />
                  ) : (
                    <Typography variant='baseMdBold' color='gray.extraDark'>
                      {userReferrals?.referredUsers || '0'}
                    </Typography>
                  )
                }
                dividerProps={{ color: 'white' }}
                showDivider
              />
              <InfoRow
                title={t('general.rewards')}
                titleStyle={{ textTransform: 'capitalize' }}
                metric={
                  isLoading ? (
                    <Skeleton
                      width={100}
                      height={30}
                      sx={{ bgcolor: customPalette.gold.extraDark }}
                    />
                  ) : (
                    <Typography variant='baseMdBold' color='gray.extraDark'>
                      {formatAmount(userReferrals?.referralYields || '0', {
                        minDecimals: 2,
                      })}{' '}
                      USD
                    </Typography>
                  )
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
