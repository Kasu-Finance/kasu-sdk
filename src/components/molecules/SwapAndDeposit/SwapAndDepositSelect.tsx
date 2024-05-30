import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  Skeleton,
  Typography,
} from '@mui/material'
import { useMemo } from 'react'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useModalStatusState from '@/hooks/context/useModalStatusState'
import useTranslation from '@/hooks/useTranslation'
import { SupportedTokenUserBalances } from '@/hooks/web3/useSupportedTokenUserBalances'

import SwapAndDepositMenuItem from '@/components/molecules/SwapAndDeposit/SwapAndDepositMenuItem'

import OneInchLogo from '@/assets/logo/OneInchLogo'

import { SupportedTokens } from '@/constants/tokens'

type SwapAndDepositInputProps = {
  title: string
  supportedTokenUserBalances:
    | Record<SupportedTokens, SupportedTokenUserBalances>
    | undefined
}

const SwapAndDepositSelect: React.FC<SwapAndDepositInputProps> = ({
  title,
  supportedTokenUserBalances,
}) => {
  const { t } = useTranslation()

  const { selectedToken, setSelectedToken } = useDepositModalState()

  const { setModalStatus } = useModalStatusState()

  const showOneInch = useMemo(
    () => selectedToken !== SupportedTokens.USDC,
    [selectedToken]
  )

  const handleChange = (e: SelectChangeEvent) => {
    const symbol = e.target.value as SupportedTokens
    setSelectedToken(symbol)

    // reset state
    setModalStatus({ type: 'default' })
  }

  return (
    <Box px={2} py={1.5}>
      <Box display='flex' alignItems='center' mb={2}>
        <Typography variant='subtitle2' component='p' mr={0.5}>
          {title}{' '}
          {showOneInch &&
            t('modals.earningsCalculator.simulatedAmount.metric-2')}
        </Typography>
        {showOneInch && <OneInchLogo />}
      </Box>

      {!supportedTokenUserBalances ? (
        <Skeleton variant='rounded' height={60} />
      ) : (
        <FormControl fullWidth={true}>
          <InputLabel
            shrink={true}
            htmlFor='multi-asset-selector'
            sx={{ textTransform: 'capitalize' }}
          >
            {t('general.availableAssets')}
          </InputLabel>
          <Select
            notched={true}
            value={selectedToken}
            inputProps={{
              id: 'multi-asset-selector',
            }}
            onChange={handleChange}
            input={
              <OutlinedInput
                sx={{ textTransform: 'capitalize' }}
                label={t('general.availableAssets')}
              />
            }
            renderValue={(val) => (
              <Box display='flex' alignItems='center' width='100%'>
                <SwapAndDepositMenuItem
                  showEstimatedPrice={val !== SupportedTokens.USDC}
                  val={supportedTokenUserBalances[val]}
                />
              </Box>
            )}
          >
            {Object.values(supportedTokenUserBalances).map((val) => (
              <MenuItem key={val.symbol} value={val.symbol}>
                <SwapAndDepositMenuItem showEstimatedPrice val={val} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </Box>
  )
}

export default SwapAndDepositSelect
