'use client'

import { Tab } from '@mui/material'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type CustomTabProps = {
  label: string
  value: string
}

const CustomTab: React.FC<CustomTabProps> = ({ label, value }) => {
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
        opacity: 1,
        minWidth: 'unset',
        ...theme.typography.baseMd,
        '& + .MuiTab-root': {
          ml: 2,
        },
      })}
    />
  )
}

export default CustomTab
