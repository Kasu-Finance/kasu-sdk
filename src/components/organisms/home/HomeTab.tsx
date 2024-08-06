'use client'

import { Tab } from '@mui/material'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type HomeTabProps = {
  label: string
  value: string
}

const HomeTab: React.FC<HomeTabProps> = ({ label, value }) => {
  const pathName = usePathname()

  return (
    <Tab
      value={value}
      label={label}
      LinkComponent={Link}
      href={value}
      sx={(theme) => ({
        color:
          value === pathName
            ? theme.palette.gray.extraDark
            : theme.palette.gray.middle,
        textTransform: 'capitalize',
        px: 0,
        ...theme.typography.baseMd,
        '& + .MuiTab-root': {
          ml: 2,
        },
      })}
    />
  )
}

export default HomeTab
