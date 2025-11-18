import { Skeleton, styled } from '@mui/material'

import { customPalette } from '@/themes/palette'

const LiteModeSkeleton = styled(Skeleton)({
  backgroundColor: customPalette.gold.dark,
})

export default LiteModeSkeleton
