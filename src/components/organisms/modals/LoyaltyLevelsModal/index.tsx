'use client'

import { Button, Stack, Typography } from '@mui/material'
import Link from 'next/link'

import useModalState from '@/hooks/context/useModalState'
import getTranslation from '@/hooks/useTranslation'

import ColoredBox from '@/components/atoms/ColoredBox'
import CustomCard from '@/components/atoms/CustomCard'
import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import UnorderedList from '@/components/atoms/UnorderedList'
import DialogContent from '@/components/molecules/DialogContent'
import DialogHeader from '@/components/molecules/DialogHeader'
import LoyaltyLevelInfo from '@/components/organisms/modals/LoyaltyLevelsModal/LoyaltyLevelInfo'

import { ModalsKeys } from '@/context/modal/modal.types'

import { TrophyIcon } from '@/assets/icons'

import { Routes } from '@/config/routes'
import { customTypography } from '@/themes/typography'

const LoyaltyLevelsModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { t } = getTranslation()

  const { modal } = useModalState()

  const { callback } = modal[ModalsKeys.LOYALTY_LEVELS]

  const handleClick = () => {
    handleClose()
    callback?.()
  }

  return (
    <CustomCard>
      <DialogHeader
        title={t('modals.loyaltyLevels.title')}
        onClose={handleClose}
      />
      <DialogContent>
        <Stack spacing={2}>
          <Stack spacing={3}>
            <ColoredBox
              sx={{ bgcolor: 'gold.dark', textAlign: 'center', py: 1.5 }}
            >
              <Typography variant='h4'>
                COMING SOON PLESE <br />
                COME BACK ONCE WE LAUNCH OUR KSU TOKEN
              </Typography>
            </ColoredBox>
            <Typography variant='h4'>
              {t('modals.loyaltyLevels.subtitle')}
            </Typography>
            <Typography variant='baseSmBold'>
              {t('modals.loyaltyLevels.description-1')}
            </Typography>
          </Stack>
          <UnorderedList
            sx={{
              listStyleType: 'none',
              pl: 0,
              li: {
                ...customTypography.baseSmBold,
                display: 'flex',
                alignItems: 'center',
                gap: 1,

                '+ li': {
                  mt: 1,
                },
              },
            }}
          >
            <li>
              <TrophyIcon />
              {t('modals.loyaltyLevels.benefits.list-0')}
            </li>
            <li>
              <TrophyIcon />
              {t('modals.loyaltyLevels.benefits.list-1')}
            </li>
            <li>
              <TrophyIcon />
              {t('modals.loyaltyLevels.benefits.list-2')}
            </li>
            <li>
              <TrophyIcon />
              {t('modals.loyaltyLevels.benefits.list-3')}
            </li>
            <li>
              <TrophyIcon />
              {t('modals.loyaltyLevels.benefits.list-4')}
            </li>
          </UnorderedList>
          <LoyaltyLevelInfo
            loyaltyLevel={0}
            title={t('locking.widgets.loyalty.level.level-0.title')}
            subtitle={
              <>
                {t('locking.widgets.loyalty.level.level-0.description-1')}
                <br />
                <br />
                {t('locking.widgets.loyalty.level.level-0.description-2')}
              </>
            }
          />
          <LoyaltyLevelInfo
            loyaltyLevel={1}
            title={t('locking.widgets.loyalty.level.level-1.title')}
            subtitle={t('locking.widgets.loyalty.level.level-1.description-1')}
            list={[
              t('locking.widgets.loyalty.level.level-1.list.list-0'),
              t('locking.widgets.loyalty.level.level-1.list.list-1'),
              t('locking.widgets.loyalty.level.level-1.list.list-2'),
            ]}
            description={t(
              'locking.widgets.loyalty.level.level-1.description-2'
            )}
          />
          <LoyaltyLevelInfo
            loyaltyLevel={2}
            title={t('locking.widgets.loyalty.level.level-2.title')}
            subtitle={t('locking.widgets.loyalty.level.level-2.description-1')}
            list={[
              t('locking.widgets.loyalty.level.level-2.list.list-0'),
              t('locking.widgets.loyalty.level.level-2.list.list-1'),
              t('locking.widgets.loyalty.level.level-2.list.list-2'),
            ]}
            description={t(
              'locking.widgets.loyalty.level.level-2.description-1'
            )}
          />
          <Typography variant='baseSm'>
            {t('modals.loyaltyLevels.description-3')}
          </Typography>
          <Button
            variant='outlined'
            color='secondary'
            onClick={handleClick}
            sx={{ textTransform: 'capitalize' }}
            LinkComponent={Link}
            href={Routes.locking.root.url}
          >
            {t('modals.lock.actions.action-1')}
          </Button>
          <Button
            variant='contained'
            color='secondary'
            onClick={handleClose}
            sx={{ textTransform: 'capitalize' }}
          >
            {t('general.return')}
          </Button>
        </Stack>
      </DialogContent>
    </CustomCard>
  )
}

export default LoyaltyLevelsModal
