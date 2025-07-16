'use client'

import {
  Button,
  Grid2,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import Link from 'next/link'

import useModalState from '@/hooks/context/useModalState'
import getTranslation from '@/hooks/useTranslation'

import ColoredBox from '@/components/atoms/ColoredBox'
import CustomCard from '@/components/atoms/CustomCard'
import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import DottedDivider from '@/components/atoms/DottedDivider'
import DialogContent from '@/components/molecules/DialogContent'
import DialogHeader from '@/components/molecules/DialogHeader'
import LoyaltyLevelInfo from '@/components/organisms/modals/LoyaltyLevelsModal/LoyaltyLevelInfo'

import { ModalsKeys } from '@/context/modal/modal.types'

import { VerifiedIcon } from '@/assets/icons'

import { Routes } from '@/config/routes'

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
              <Typography variant='h5' px={5}>
                We’re working hard on the launch of the KASU token. In the
                meantime, start lending so you’re the first to benefit once KASU
                launches, which you can learn more about below
              </Typography>
            </ColoredBox>
            <Typography variant='h4'>
              {t('modals.loyaltyLevels.subtitle')}
            </Typography>
          </Stack>
          <Stack spacing={4}>
            <Grid2 container rowGap={1}>
              <Grid2 size={6} gap={1} display='flex' alignItems='center'>
                <VerifiedIcon />
                <Typography variant='baseSmBold'>
                  {t('modals.loyaltyLevels.benefits.list-0')}
                </Typography>
              </Grid2>
              <Grid2 size={6} gap={1} display='flex' alignItems='center'>
                <VerifiedIcon />
                <Typography variant='baseSmBold'>
                  {t('modals.loyaltyLevels.benefits.list-1')}
                </Typography>
              </Grid2>
              <Grid2 size={6} gap={1} display='flex' alignItems='center'>
                <VerifiedIcon />
                <Typography variant='baseSmBold'>
                  {t('modals.loyaltyLevels.benefits.list-2')}
                </Typography>
              </Grid2>
              <Grid2 size={6} gap={1} display='flex' alignItems='center'>
                <VerifiedIcon />
                <Typography variant='baseSmBold'>
                  {t('modals.loyaltyLevels.benefits.list-3')}
                </Typography>
              </Grid2>
            </Grid2>

            <Stack spacing={1}>
              <Typography variant='h4'>
                {t('modals.loyaltyLevels.subtitle-2')}
              </Typography>
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      '.MuiTableCell-root': { borderColor: 'gray.extraDark' },
                    }}
                  >
                    <TableCell sx={{ px: 0 }}>
                      {t('modals.loyaltyLevels.tableHeader.cell-1')}
                    </TableCell>
                    <TableCell>
                      {t('modals.loyaltyLevels.tableHeader.cell-2')}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody
                  sx={{
                    '.MuiTableCell-root': {
                      border: 'none',
                      '&:first-child': { px: 0 },
                    },
                  }}
                >
                  <TableRow>
                    <TableCell>30 {t('time.days')}</TableCell>
                    <TableCell>0.05× {t('general.multiplier')}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell padding='none' colSpan={2}>
                      <DottedDivider />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>180 {t('time.days')}</TableCell>
                    <TableCell>0.25× {t('general.multiplier')}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell padding='none' colSpan={2}>
                      <DottedDivider />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>360 {t('time.days')}</TableCell>
                    <TableCell>0.50× {t('general.multiplier')}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell padding='none' colSpan={2}>
                      <DottedDivider />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>720 {t('time.days')}</TableCell>
                    <TableCell>1.00× {t('general.multiplier')}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell padding='none' colSpan={2}>
                      <DottedDivider />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Stack>
          </Stack>
          <Typography variant='baseSm' color='#855726'>
            {t('modals.loyaltyLevels.description-1')}
          </Typography>
          <LoyaltyLevelInfo
            loyaltyLevel={0}
            subtitle={t('locking.widgets.loyalty.level.level-0.description-1')}
            title={t('locking.widgets.loyalty.level.level-0.title')}
            benefits={[
              {
                title: t(
                  'locking.widgets.loyalty.level.level-0.benefits.benefits-0.title'
                ),
                description: {
                  title: t(
                    'locking.widgets.loyalty.level.level-0.benefits.benefits-0.description.title'
                  ),
                  value: t(
                    'locking.widgets.loyalty.level.level-0.benefits.benefits-0.description.value'
                  ),
                },
              },
            ]}
          />
          <LoyaltyLevelInfo
            loyaltyLevel={1}
            title={t('locking.widgets.loyalty.level.level-1.title')}
            subtitle={t('locking.widgets.loyalty.level.level-1.description-1')}
            benefits={[
              {
                title: t(
                  'locking.widgets.loyalty.level.level-1.benefits.benefits-0.title'
                ),
                description: {
                  title: t(
                    'locking.widgets.loyalty.level.level-1.benefits.benefits-0.description.title'
                  ),
                  value: t(
                    'locking.widgets.loyalty.level.level-1.benefits.benefits-0.description.value'
                  ),
                },
              },
              {
                title: t(
                  'locking.widgets.loyalty.level.level-1.benefits.benefits-1.title'
                ),
                isPartial: true,
                description: {
                  title: t(
                    'locking.widgets.loyalty.level.level-1.benefits.benefits-1.description.title'
                  ),
                  value: t(
                    'locking.widgets.loyalty.level.level-1.benefits.benefits-1.description.value'
                  ),
                },
              },
              {
                title: t(
                  'locking.widgets.loyalty.level.level-1.benefits.benefits-2.title'
                ),

                isPartial: true,
                description: {
                  title: t(
                    'locking.widgets.loyalty.level.level-1.benefits.benefits-2.description.title'
                  ),
                  value: t(
                    'locking.widgets.loyalty.level.level-1.benefits.benefits-2.description.value'
                  ),
                },
              },
              {
                title: t(
                  'locking.widgets.loyalty.level.level-1.benefits.benefits-3.title'
                ),
                isPartial: true,
                description: {
                  title: t(
                    'locking.widgets.loyalty.level.level-1.benefits.benefits-3.description.title'
                  ),
                  value: t(
                    'locking.widgets.loyalty.level.level-1.benefits.benefits-3.description.value'
                  ),
                },
              },
            ]}
          />
          <LoyaltyLevelInfo
            loyaltyLevel={2}
            title={t('locking.widgets.loyalty.level.level-2.title')}
            subtitle={t('locking.widgets.loyalty.level.level-2.description-1')}
            benefits={[
              {
                title: t(
                  'locking.widgets.loyalty.level.level-2.benefits.benefits-0.title'
                ),
                description: {
                  title: t(
                    'locking.widgets.loyalty.level.level-2.benefits.benefits-0.description.title'
                  ),
                  value: t(
                    'locking.widgets.loyalty.level.level-2.benefits.benefits-0.description.value'
                  ),
                },
              },
              {
                title: t(
                  'locking.widgets.loyalty.level.level-2.benefits.benefits-1.title'
                ),
                description: {
                  title: t(
                    'locking.widgets.loyalty.level.level-2.benefits.benefits-1.description.title'
                  ),
                  value: t(
                    'locking.widgets.loyalty.level.level-2.benefits.benefits-1.description.value'
                  ),
                },
              },
              {
                title: t(
                  'locking.widgets.loyalty.level.level-2.benefits.benefits-2.title'
                ),

                description: {
                  title: t(
                    'locking.widgets.loyalty.level.level-2.benefits.benefits-2.description.title'
                  ),
                  value: t(
                    'locking.widgets.loyalty.level.level-2.benefits.benefits-2.description.value'
                  ),
                },
              },
              {
                title: t(
                  'locking.widgets.loyalty.level.level-2.benefits.benefits-3.title'
                ),
                description: {
                  title: t(
                    'locking.widgets.loyalty.level.level-2.benefits.benefits-3.description.title'
                  ),
                  value: t(
                    'locking.widgets.loyalty.level.level-2.benefits.benefits-3.description.value'
                  ),
                },
              },
            ]}
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
