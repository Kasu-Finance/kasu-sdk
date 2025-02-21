import { Box, IconButton, SxProps, Theme, TypographyProps } from '@mui/material'
import Image from 'next/image'
import { ReactNode } from 'react'

import CustomCardHeader from '@/components/atoms/CustomCard/CustomCardHeader'

import { CloseRoundedIcon } from '@/assets/icons'

import PeepingCat from '@/images/peeping-cat.png'

type DialogHeaderProps = {
  title: ReactNode
  titleProps?: TypographyProps
  children?: ReactNode
  showClose?: boolean
  isFullscreen?: boolean
  containerSx?: SxProps<Theme>
  onClose: () => void
}

const DialogHeader: React.FC<DialogHeaderProps> = ({
  title,
  titleProps,
  isFullscreen,
  showClose = true,
  onClose,
}) => {
  return (
    <CustomCardHeader
      title={title}
      titleProps={{ variant: 'h4', ...titleProps }}
      minHeight={72}
      display='flex'
      justifyContent='center'
    >
      <Box
        width={isFullscreen ? '100%' : 600}
        position='absolute'
        sx={{ transform: 'translateY(-72px)' }}
        display='flex'
        justifyContent='center'
      >
        <Box
          component={Image}
          src={PeepingCat}
          alt='peeping cat'
          width={267}
          height={123}
        />
        {showClose && (
          <IconButton
            onClick={onClose}
            sx={{ position: 'absolute', right: 16, top: 16 }}
          >
            <CloseRoundedIcon />
          </IconButton>
        )}
      </Box>
    </CustomCardHeader>
  )
}

export default DialogHeader
