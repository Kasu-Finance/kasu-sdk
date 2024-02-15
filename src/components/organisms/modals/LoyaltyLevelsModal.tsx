'use client'

import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  Typography,
} from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import List from '@/components/atoms/List'
import DialogHeader from '@/components/molecules/DialogHeader'

import { VerifiedIcon } from '@/assets/icons'

const LoyaltyLevelsModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { t } = useTranslation()

  return (
    <>
      <DialogHeader
        title={t('modals.loyalityLevels.title')}
        onClose={handleClose}
      />
      <DialogContent sx={{ px: 3, py: 1 }}>
        <Box display='grid' gap={2}>
          <Typography variant='h5' component='span' display='block'>
            {t('modals.loyalityLevels.subtitle-1')}
          </Typography>
          <Typography variant='body1' component='p'>
            {t('modals.loyalityLevels.description-1')}
          </Typography>
          <Box
            display='grid'
            gridTemplateColumns='max-content minmax(0, 1fr)'
            alignItems='start'
            gap={1}
          >
            <Box pt='10px'>
              <VerifiedIcon />
            </Box>
            <Typography variant='h6' component='span'>
              {t('modals.loyalityLevels.subtitle-2')}
            </Typography>
          </Box>
          <Typography variant='body1' component='p'>
            {t('modals.loyalityLevels.description-2')}
          </Typography>
          <Box
            display='grid'
            gridTemplateColumns='max-content minmax(0, 1fr)'
            alignItems='start'
            gap={1}
          >
            <Box pt='10px'>
              <VerifiedIcon />
            </Box>
            <Typography variant='h6' component='span'>
              {t('modals.loyalityLevels.level')} 1 <br />
              {t('modals.loyalityLevels.level-1.description')}
            </Typography>
          </Box>
          <List>
            <li>
              <Typography variant='body1' component='p'>
                {t('modals.loyalityLevels.level-1.prop-1')}
              </Typography>
            </li>
            <li>
              <Typography variant='body1' component='p'>
                {t('modals.loyalityLevels.level-1.prop-2')}
              </Typography>
            </li>
            <li>
              <Typography variant='body1' component='p'>
                {t('modals.loyalityLevels.level-1.prop-3')}
              </Typography>
            </li>
          </List>
          <Box
            display='grid'
            gridTemplateColumns='max-content minmax(0, 1fr)'
            alignItems='start'
            gap={1}
          >
            <Box pt='10px'>
              <VerifiedIcon />
            </Box>
            <Typography variant='h6' component='span'>
              {t('modals.loyalityLevels.level')} 2 <br />
              {t('modals.loyalityLevels.level-2.description')}
            </Typography>
          </Box>
          <List>
            <li>
              <Typography variant='body1' component='p'>
                {t('modals.loyalityLevels.level-2.prop-1')}
              </Typography>
            </li>
            <li>
              <Typography variant='body1' component='p'>
                {t('modals.loyalityLevels.level-2.prop-2')}
              </Typography>
            </li>
            <li>
              <Typography variant='body1' component='p'>
                {t('modals.loyalityLevels.level-2.prop-3')}
              </Typography>
            </li>
          </List>
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center' }}>
        <Button variant='contained' onClick={handleClose}>
          {t('general.close')}
        </Button>
      </DialogActions>
    </>
  )
}

export default LoyaltyLevelsModal
