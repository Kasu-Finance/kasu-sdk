import { Box, Checkbox, CheckboxProps } from '@mui/material'

import { CheckedIcon } from '@/assets/icons'

const CustomCheckbox: React.FC<CheckboxProps> = (props) => {
  return (
    <Checkbox
      icon={<Box bgcolor='white' width={24} height={24} borderRadius={1} />}
      checkedIcon={
        <Box
          bgcolor='gray.extraDark'
          width={24}
          height={24}
          borderRadius={1}
          display='flex'
          alignItems='center'
          justifyContent='center'
        >
          <CheckedIcon />
        </Box>
      }
      {...props}
    />
  )
}

export default CustomCheckbox
