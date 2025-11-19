import { Box, Button, Skeleton, Stack, Typography } from '@mui/material'

import useModalState from '@/hooks/context/useModalState'
import useReferralLink from '@/hooks/referrals/useReferralLink'
import useUserReferrals, {
  ReferredUserDetails,
} from '@/hooks/referrals/useUserReferrals'
import getTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import InfoRow from '@/components/atoms/InfoRow'
import WaveBox from '@/components/atoms/WaveBox'
import DialogHeader from '@/components/molecules/DialogHeader'

import { ModalsKeys } from '@/context/modal/modal.types'

import { CopyIcon } from '@/assets/icons'

import { customPalette } from '@/themes/palette'
import { customTypography } from '@/themes/typography'
import { formatAmount } from '@/utils'

const ReferralModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { t } = getTranslation()

  const { openModal } = useModalState()

  const referralLink = useReferralLink()

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const { userReferrals, isLoading } = useUserReferrals()

  const handleClick = (referredUsers: ReferredUserDetails[]) => {
    openModal({ name: ModalsKeys.REFERRED_USERS, referredUsers })
  }

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
                onClick={() => handleCopy(referralLink.fullUrl)}
              >
                <Typography
                  variant='inherit'
                  sx={{
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                  }}
                >
                  {referralLink.shortenUrl}
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
                      {formatAmount(
                        userReferrals?.referralYieldLifetime || '0',
                        {
                          minDecimals: 2,
                        }
                      )}{' '}
                      USD
                    </Typography>
                  )
                }
              />
            </Stack>
            <Button
              variant='contained'
              color='secondary'
              fullWidth
              onClick={() =>
                handleClick(userReferrals?.referredUsersDetails ?? [])
              }
              sx={{ textTransform: 'capitalize' }}
            >
              View Referrals
            </Button>
          </Stack>
        </Stack>
      </WaveBox>
    </CustomCard>
  )
}

export default ReferralModal
