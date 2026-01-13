import { Box } from '@mui/material'

type KasuHorizontalGoldWhiteProps = {
  height?: number
}

const KasuHorizontalGoldWhite: React.FC<KasuHorizontalGoldWhiteProps> = ({
  height = 32,
}) => (
  <Box
    component='img'
    src='/images/KASU%20logo%20horizontal%20white%20and%20gold.png'
    alt='KASU'
    sx={{
      display: 'inline-block',
      height,
      width: 'auto',
      maxWidth: '100%',
      objectFit: 'contain',
    }}
  />
)

export default KasuHorizontalGoldWhite
