'use client'

import { Box, Button, Modal, Typography } from '@mui/material'

import List from '@/components/atoms/List'
import ModalBody from '@/components/atoms/ModalBody'
import ModalHeader from '@/components/molecules/ModalHeader'

import { VerifiedIcon } from '@/assets/icons'

import useModalState from '@/context/modal/useModalState'

const LoyaltyLevelsModal = () => {
  const { modal, closeModal } = useModalState()

  const handleClose = () => closeModal('loyaltyLevelsModal')

  return (
    <Modal
      open={modal['loyaltyLevelsModal'].isOpen}
      onClose={handleClose}
      aria-labelledby='Connect Wallet Modal'
      aria-describedby='List of available web3 wallet connections'
    >
      <ModalBody>
        <ModalHeader title='Loyalty levels' onClose={handleClose} />
        <Box display='grid' gap={2} my={1}>
          <Typography variant='h5' component='span' display='block'>
            About the loyalty program
          </Typography>
          <Typography variant='body1' component='p'>
            KSU Token Loyalty Locked KSU tokens provide additional benefits at
            various loyalty levels. These are as follows:
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
              Regular/No KSU tokens locked:
            </Typography>
          </Box>
          <Typography variant='body1' component='p'>
            Normal yields stated in each pool are received, and
            deposit/withdrawal requests are processed after Loyalty level 1 and
            2 stakers.
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
              Loyalty Level 1 <br />
              Locking at least 1% of the user’s deposit balance on the platform
              in KSU Tokens provides:
            </Typography>
          </Box>
          <List>
            <li>
              <Typography variant='body1' component='p'>
                Second priority for deposits into pools.
              </Typography>
            </li>
            <li>
              <Typography variant='body1' component='p'>
                Second priority for capital withdrawals at the end of each
                Epoch.
              </Typography>
            </li>
            <li>
              <Typography variant='body1' component='p'>
                Launch bonus: 0.1% extra yield in all pools, paid in KSU tokens.
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
              Loyalty Level 2 <br />
              Locking at least 5% of the user’s deposit balance on the platform
              in KSU Tokens provides:
            </Typography>
          </Box>
          <List>
            <li>
              <Typography variant='body1' component='p'>
                First priority for deposits into pools.
              </Typography>
            </li>
            <li>
              <Typography variant='body1' component='p'>
                First priority for capital withdrawals at the end of each Epoch.
              </Typography>
            </li>
            <li>
              <Typography variant='body1' component='p'>
                Launch bonus: 0.2% extra yield in all pools, paid in KSU tokens
              </Typography>
            </li>
          </List>
        </Box>
        <Button
          variant='contained'
          onClick={handleClose}
          sx={{ my: 1, mx: 'auto', display: 'block' }}
        >
          Close
        </Button>
      </ModalBody>
    </Modal>
  )
}

export default LoyaltyLevelsModal
