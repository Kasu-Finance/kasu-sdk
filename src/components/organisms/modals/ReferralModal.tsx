import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import { Box, Button, Skeleton, Stack, Typography } from '@mui/material'
import { useRef, useState } from 'react'

import useModalState from '@/hooks/context/useModalState'
import usePoolOverviews from '@/hooks/lending/usePoolOverviews'
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
import ReferralShareImageCard from '@/components/organisms/modals/ReferralShareImageCard'

import { ModalsKeys } from '@/context/modal/modal.types'

import { XIcon } from '@/assets/icons'

import { customPalette } from '@/themes/palette'
import { formatAmount, formatPercentage } from '@/utils'
import { getHighestYieldTrancheWithCapacity } from '@/utils/lending'

type OverlayOption = 'no' | 'kasu1' | 'kasu2' | 'kasu3'

const ReferralModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { t } = getTranslation()

  const { modal, openModal } = useModalState()

  const referralLink = useReferralLink()

  const shareCardRef = useRef<HTMLDivElement | null>(null)
  const [isDownloadingImage, setIsDownloadingImage] = useState(false)
  const [overlayOption, setOverlayOption] = useState<OverlayOption>('no')

  const handleCopyLink = () =>
    navigator.clipboard.writeText(referralLink.fullUrl)

  const handleDownloadShareImage = async () => {
    if (!shareCardRef.current) return

    setIsDownloadingImage(true)
    try {
      await (document as any).fonts?.ready

      const { toPng } = await import('html-to-image')

      const dataUrl = await toPng(shareCardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      })

      const link = document.createElement('a')
      link.download = 'kasu-referral.png'
      link.href = dataUrl
      link.click()
    } finally {
      setIsDownloadingImage(false)
    }
  }

  const handleShareOnX = () => {
    const text = [t('modals.referral.shareOnX.text'), ''].join('\n')

    const intentUrl = `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(`${referralLink.fullUrl}`)}`
    window.open(intentUrl, '_blank', 'noopener,noreferrer')
  }

  const { userReferrals, isLoading } = useUserReferrals()

  const handleClick = (referredUsers: ReferredUserDetails[]) => {
    openModal({ name: ModalsKeys.REFERRED_USERS, referredUsers })
  }

  const referralModalState = modal[ModalsKeys.REFERRAL]
  const isFromLending = referralModalState.source === 'lending'

  const { poolOverviews } = usePoolOverviews()

  const bestTrancheReference = !isFromLending
    ? getHighestYieldTrancheWithCapacity(poolOverviews)
    : null

  const shareHeadline = isFromLending
    ? referralModalState.lendingPoolName || 'Kasu'
    : (bestTrancheReference?.pool.poolName ??
      t('modals.referral.shareImage.defaultHeadline'))

  const trancheLabel = isFromLending
    ? referralModalState.trancheName
      ? `${referralModalState.trancheName} tranche`
      : t('modals.referral.shareImage.defaultSubheadline')
    : bestTrancheReference?.tranche.name
      ? `${bestTrancheReference.tranche.name} tranche`
      : t('modals.referral.shareImage.defaultSubheadline')

  const apyPercent = isFromLending
    ? referralModalState.apy
    : typeof bestTrancheReference?.apy === 'number'
      ? formatPercentage(bestTrancheReference.apy)
      : undefined

  const overlayOptions: {
    id: OverlayOption
    label: string
    imageSrc?: string
  }[] = [
    { id: 'no', label: 'No' },
    { id: 'kasu1', label: 'Kasu 1', imageSrc: '/images/referral-1.png' },
    { id: 'kasu2', label: 'Kasu 2', imageSrc: '/images/referral-2.png' },
    { id: 'kasu3', label: 'Kasu 3', imageSrc: '/images/referral-3.png' },
  ]

  const selectedOverlay = overlayOptions.find((o) => o.id === overlayOption)
  const overlayImageSrc =
    selectedOverlay?.id === 'no' ? undefined : selectedOverlay?.imageSrc

  const actionButtonSx = {
    textTransform: 'capitalize',
    flex: 1,
    minWidth: 140,
  } as const

  return (
    <CustomCard>
      <DialogHeader
        title={t('modals.referral.title')}
        titleProps={{ sx: { textTransform: 'unset' } }}
        onClose={handleClose}
      />
      <WaveBox variant='gold' px={1.5} py={2} borderRadius={2}>
        <Stack spacing={2.5}>
          <Stack spacing={1.5}>
            <Typography variant='baseMd' textAlign='center'>
              {t('modals.referral.description')}
            </Typography>
            <Stack spacing={1.25}>
              <Box
                display='flex'
                gap={2}
                alignItems='stretch'
                sx={{
                  flexDirection: { xs: 'column', sm: 'row' },
                }}
              >
                <Box
                  sx={{
                    width: 'min(560px, 100%)',
                    position: 'relative',
                    mx: 'auto',
                  }}
                >
                  <ReferralShareImageCard
                    ref={shareCardRef}
                    headline={shareHeadline}
                    trancheLabel={trancheLabel}
                    apyPercent={apyPercent}
                    referralUrl={referralLink.fullUrl}
                    overlayImageSrc={overlayImageSrc}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      display: 'flex',
                      flexDirection: 'row',
                      gap: 1,
                      zIndex: 10,
                    }}
                  >
                    {overlayOptions.map((option) => {
                      const isSelected = option.id === overlayOption
                      return (
                        <Box
                          key={option.id}
                          component='button'
                          type='button'
                          aria-label={`Overlay: ${option.label}`}
                          aria-pressed={isSelected}
                          onClick={() => setOverlayOption(option.id)}
                          sx={{
                            cursor: 'pointer',
                            p: 0,
                            m: 0,
                            width: 38,
                            height: 38,
                            borderRadius: 1.5,
                            border: `1px solid ${
                              isSelected
                                ? customPalette.primary.main
                                : 'rgba(255, 255, 255, 0.35)'
                            }`,
                            bgcolor: 'transparent',
                            display: 'grid',
                            placeItems: 'center',
                            outline: 'none',
                            transition:
                              'border-color 120ms ease, background-color 120ms ease',
                            '&:hover': {
                              borderColor: customPalette.primary.main,
                              bgcolor: 'rgba(0, 0, 0, 0.18)',
                            },
                            '&:focus-visible': {
                              borderColor: customPalette.primary.main,
                              boxShadow: `0 0 0 3px rgba(196, 153, 108, 0.25)`,
                            },
                          }}
                        >
                          {option.id === 'no' ? (
                            <Box
                              aria-hidden
                              sx={{
                                width: 20,
                                height: 20,
                                position: 'relative',
                                '&::after': {
                                  content: '""',
                                  position: 'absolute',
                                  left: -7,
                                  top: '50%',
                                  width: 38,
                                  height: 2,
                                  bgcolor: customPalette.gold.middle,
                                  transform: 'translateY(-50%) rotate(45deg)',
                                },
                              }}
                            />
                          ) : (
                            <Box
                              component='img'
                              src={option.imageSrc}
                              alt=''
                              aria-hidden
                              sx={{ height: 26, width: 'auto' }}
                            />
                          )}
                        </Box>
                      )
                    })}
                  </Box>
                </Box>
              </Box>

              <Box display='flex' gap={0.75} flexWrap='wrap'>
                <Button
                  variant='outlined'
                  color='secondary'
                  onClick={handleCopyLink}
                  startIcon={<ContentCopyRoundedIcon sx={{ fontSize: 16 }} />}
                  sx={actionButtonSx}
                >
                  {t('modals.referral.actions.copyLink')}
                </Button>
                <Button
                  variant='outlined'
                  color='secondary'
                  onClick={handleDownloadShareImage}
                  disabled={isDownloadingImage}
                  startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />}
                  sx={actionButtonSx}
                >
                  {t('modals.referral.actions.saveImage')}
                </Button>
                <Button
                  variant='outlined'
                  color='secondary'
                  onClick={handleShareOnX}
                  startIcon={<XIcon />}
                  sx={actionButtonSx}
                >
                  {t('modals.referral.shareOnX.action')}
                </Button>
              </Box>
            </Stack>
          </Stack>
          <Stack spacing={0.75}>
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
